using System.Text.Json;
using System.Text.Json.Serialization;

namespace SaveApp.Api.DTOs.User
{
    public class UpdateUserDto
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";

        [JsonExtensionData]
        public Dictionary<string, JsonElement> AdditionalData { get; set; } = new();
    }
}
