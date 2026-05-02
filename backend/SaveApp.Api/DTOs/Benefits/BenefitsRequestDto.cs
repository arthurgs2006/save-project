namespace SaveApp.Api.DTOs.Benefits
{
    public class BenefitsRequestDto
    {
        public int UserId { get; set; }
        public bool IsStudent { get; set; }
        public string InstitutionName { get; set; } = "";
        public string Course { get; set; } = "";
        public string Period { get; set; } = "";
        public string WorkStatus { get; set; } = "";
        public int PeopleAtHome { get; set; }
        public string HousingSituation { get; set; } = "";
        public bool LivesFarFromInstitution { get; set; }
    }
}