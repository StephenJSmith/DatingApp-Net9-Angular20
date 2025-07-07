using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(AppDbContext context, ITokenService tokenService) : BaseApiController
{
  [HttpPost("register")]
  public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
  {
    if (await IsExistingEmail(dto.Email))
    {
      return BadRequest("Email already exists");
    }

    using var hmac = new HMACSHA512();
    var user = new AppUser
    {
      DisplayName = dto.DisplayName,
      Email = dto.Email,
      PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
      PasswordSalt = hmac.Key
    };

    context.Users.Add(user);
    await context.SaveChangesAsync();

    var userDto =  user.ToDto(tokenService);

    return userDto;
  }

  [HttpPost("login")]
  public async Task<ActionResult<UserDto>> Login(LoginDto dto)
  {
    var user = await context.Users.SingleOrDefaultAsync(x =>
      x.Email.ToLower() == dto.Email.ToLower());
    if (user == null) return Unauthorized("Invalid email");

    using var hmac = new HMACSHA512(user.PasswordSalt);
    var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));

    for (var i = 0; i < computedHash.Length; i++)
    {
      if (computedHash[i] != user.PasswordHash[i])
      {
        return Unauthorized("Invalid password");
      }
    }

    var userDto =  user.ToDto(tokenService);

    return userDto;
  }

  private async Task<bool> IsExistingEmail(string email)
  {
    return await context.Users.AnyAsync(x => x.Email.ToLower() == email.ToLower());
  }
}