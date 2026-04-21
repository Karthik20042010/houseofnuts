import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Review, getReviews, addReview } from "@/lib/reviews";
import { useToast } from "@/hooks/use-toast";

interface ReviewsSectionProps {
  productId: string;
}

const ReviewsSection = ({ productId }: ReviewsSectionProps) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setReviews(getReviews(productId));
  }, [productId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedText = text.trim();

    if (!trimmedName || trimmedName.length > 50) {
      toast({ title: "Invalid name", description: "Name must be 1-50 characters.", variant: "destructive" });
      return;
    }
    if (!trimmedText || trimmedText.length > 500) {
      toast({ title: "Invalid review", description: "Review must be 1-500 characters.", variant: "destructive" });
      return;
    }
    if (rating < 1 || rating > 5) return;

    addReview({ productId, name: trimmedName, text: trimmedText, rating });
    setReviews(getReviews(productId));
    setName("");
    setText("");
    setRating(5);
    setShowForm(false);
    toast({ title: "Thank you!", description: "Your review has been posted." });
  };

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-8 flex-wrap gap-4">
        <h2 className="font-display text-3xl">Customer Reviews</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 border border-border hover:border-foreground/30 transition-colors font-body font-medium"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-clay-light/50 p-6 border border-border mb-8 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                  className="p-1"
                >
                  <Star
                    size={24}
                    className={n <= (hoverRating || rating) ? "fill-accent text-accent" : "text-border"}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
              className="w-full px-4 py-3 bg-background border border-border focus:border-foreground/40 outline-none font-body text-sm"
              placeholder="e.g. Priya S."
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-body block mb-2">Your Review</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              required
              rows={4}
              className="w-full px-4 py-3 bg-background border border-border focus:border-foreground/40 outline-none font-body text-sm resize-none"
              placeholder="Share your experience..."
            />
            <p className="text-[11px] text-muted-foreground font-body mt-1">{text.length}/500</p>
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-8 py-3 uppercase tracking-[0.15em] text-xs font-medium hover:bg-accent transition-colors font-body"
          >
            Submit Review
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-clay-light/50 p-6 border border-border">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < review.rating ? "fill-accent text-accent" : "text-border"} />
              ))}
            </div>
            <p className="font-body text-sm leading-relaxed mb-4">{review.text}</p>
            <div className="flex justify-between text-xs text-muted-foreground font-body">
              <span className="font-medium text-foreground">{review.name}</span>
              <span>{review.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewsSection;
