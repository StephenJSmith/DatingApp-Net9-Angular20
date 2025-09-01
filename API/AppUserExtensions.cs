using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API;

public static class AppUserExtensions
{
  public static async Task<UserDto> ToDto(
    this AppUser user, ITokenService tokenService)  
  {
    var userDto = new UserDto
    {
      Id = user.Id,
      Email = user.Email!,
      DisplayName = user.DisplayName,
      ImageUrl = user.ImageUrl,
      Token = await tokenService.CreateToken(user)
    };

    return userDto;
  }
}
