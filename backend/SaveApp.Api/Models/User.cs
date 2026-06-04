using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SaveApp.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";

        [JsonExtensionData]
        public Dictionary<string, JsonElement> AdditionalData { get; set; } = new();
    }
}