namespace SaveApp.Api.Models
{
    public class BenefitsProfile
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public bool IsStudent { get; set; }
        public string InstitutionName { get; set; } = "";
        public string Course { get; set; } = "";
        public string Period { get; set; } = "";
        public string WorkStatus { get; set; } = "";
        public int PeopleAtHome { get; set; }
        public string HousingSituation { get; set; } = "";
        public bool LivesFarFromInstitution { get; set; }

        public List<string> GeneratedBenefits { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }
}