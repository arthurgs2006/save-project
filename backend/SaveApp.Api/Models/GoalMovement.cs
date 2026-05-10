namespace SaveApp.Api.Models
{
    public class GoalMovement
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = "";
        public string Type { get; set; } = ""; // add ou remove
        public DateTime Date { get; set; } = DateTime.Now;
    }
}