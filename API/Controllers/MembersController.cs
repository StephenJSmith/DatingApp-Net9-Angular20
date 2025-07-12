using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class MembersController(
  IMemberRepository memberRepository,
  IPhotoService photoService) : BaseApiController
{
  [HttpGet]
  public async Task<ActionResult<IReadOnlyList<Member>>> GetMembers()
  {
    var members = await memberRepository.GetMembersAsync();

    return Ok(members);
  }

  [HttpGet("{id}")]
  public async Task<ActionResult<Member>> GetMember(string id)
  {
    var member = await memberRepository.GetMemberByIdAsync(id);
    if (member == null) return NotFound();

    return member;
  }

  [HttpGet("{id}/photos")]
  public async Task<ActionResult<IReadOnlyList<Photo>>> GetMemberPhotos(string id)
  {
    var photos = await memberRepository.GetPhotosForMemberAsync(id);

    return Ok(photos);
  }

  [HttpPut]
  public async Task<ActionResult> UpdateMember(MemberUpdateDto memberUpdateDto)
  {
    var memberId = User.GetMemberId();
    var member = await memberRepository.GetMemberForUpdate(memberId);
    if (member == null) return BadRequest("Member not found");

    member.DisplayName = memberUpdateDto.DisplayName ?? member.DisplayName;
    member.Description = memberUpdateDto.Description ?? member.Description;
    member.City = memberUpdateDto.City ?? member.City;
    member.Country = memberUpdateDto.Country ?? member.Country;

    member.User.DisplayName = memberUpdateDto.DisplayName ?? member.User.DisplayName;

    var isPersisted = await memberRepository.SaveAllAsync();
    if (!isPersisted) return BadRequest("Failed to save member");

    return NoContent();
  }

  [HttpPost("add-photo")]
  public async Task<ActionResult<Photo>> AddPhoto([FromForm] IFormFile file)
  {
    var member = await memberRepository.GetMemberForUpdate(User.GetMemberId());
    if (member == null) return BadRequest("Member not found - cannot be updated");

    var result = await photoService.UploadPhotoAsync(file);
    if (result.Error != null) return BadRequest(result.Error.Message);

    var photo = new Photo
    {
      Url = result.SecureUrl.AbsoluteUri,
      PublicId = result.PublicId,
      MemberId = User.GetMemberId()
    };

    if (member.ImageUrl == null)
    {
      member.ImageUrl = photo.Url;
      member.User.ImageUrl = photo.Url;
    }

    member.Photos.Add(photo);
    var isPersisted = await memberRepository.SaveAllAsync();
    if (!isPersisted) return BadRequest("Failed to add photo");

    return photo;
  }

  [HttpPut("set-main-photo/{photoId}")]
  public async Task<ActionResult> SetMainPhoto(int photoId)
  {
    var member = await memberRepository.GetMemberForUpdate(User.GetMemberId());
    if (member == null) return BadRequest("Member not found - cannot be updated");

    var photo = member.Photos.SingleOrDefault(x => x.Id == photoId);
    if (member.ImageUrl == photo?.Url || photo == null)
    {
      return BadRequest("Cannot set this as main photo");
    }

    member.ImageUrl = photo.Url;
    member.User.ImageUrl = photo.Url;

    var isPersisted = await memberRepository.SaveAllAsync();
    if (!isPersisted) return BadRequest("Failed to set main photo");

    return NoContent();
  }

  [HttpDelete("delete-photo/{photoId}")]
  public async Task<ActionResult> DeleteMember(int photoId)
  {
    var member = await memberRepository.GetMemberForUpdate(User.GetMemberId());
    if (member == null) return BadRequest("Member not found - cannot be deleted");

    var photo = member.Photos.SingleOrDefault(x => x.Id == photoId);
    if (member.ImageUrl == photo?.Url || photo == null)
    {
      return BadRequest("Cannot delete this photo");
    }

    if (photo.PublicId != null)
    {
      var result = await photoService.DeletePhotoAsync(photo.PublicId);
      if (result.Error != null) return BadRequest(result.Error.Message);
    }

    member.Photos.Remove(photo);
    
    var isPersisted = await memberRepository.SaveAllAsync();
    if (!isPersisted) return BadRequest("Failed to delete photo");

    return Ok();
  }
}
