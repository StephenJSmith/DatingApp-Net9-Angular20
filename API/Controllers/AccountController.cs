using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService) : BaseApiController
{
  [HttpPost("register")]
  public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
  {
    var user = new AppUser
    {
      DisplayName = dto.DisplayName,
      Email = dto.Email,
      UserName = dto.Email,
      Member = new Member
      {
        DisplayName = dto.DisplayName,
        Gender = dto.Gender,
        City = dto.City,
        Country = dto.Country,
        DateOfBirth = dto.DateOfBirth
      }
    };

    var result = await userManager.CreateAsync(user, dto.Password);
    if (!result.Succeeded)
    {
      foreach (var error in result.Errors)
      {
        ModelState.AddModelError("identity", error.Description);
      }

      return ValidationProblem();
    }

    await userManager.AddToRoleAsync(user, "Member");
    await SetRefreshTokenCookie(user);

    return await user.ToDto(tokenService);
  }

  [HttpPost("login")]
  public async Task<ActionResult<UserDto>> Login(LoginDto dto)
  {
    var user = await userManager.FindByEmailAsync(dto.Email);
    if (user == null) return Unauthorized("Invalid email");

    var result = await userManager.CheckPasswordAsync(user, dto.Password);
    if (!result) return Unauthorized("Invalid password");

    await SetRefreshTokenCookie(user);
    var userDto = await user.ToDto(tokenService);

    return userDto;
  }

  [HttpPost("refresh-token")]
  public async Task<ActionResult<UserDto>> RefreshToken()
  {
    var refreshToken = Request.Cookies["refreshToken"];
    if (refreshToken == null) return NoContent();

    var user = await userManager.Users
      .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken
        && x.RefreshTokenExpiry > DateTime.UtcNow);
    if (user == null) return Unauthorized();

    await SetRefreshTokenCookie(user);
    var userDto = await user.ToDto(tokenService);

    return userDto;
  }

  private async Task SetRefreshTokenCookie(AppUser user)
  {
    var refreshToken = tokenService.GenerateRefreshToken();
    user.RefreshToken = refreshToken;
    user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
    await userManager.UpdateAsync(user);

    var cookieOptions = new CookieOptions
    {
      HttpOnly = true,
      Secure = true,
      SameSite = SameSiteMode.Strict,
      Expires = DateTime.UtcNow.AddDays(7)
    };

    Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
  }
}
