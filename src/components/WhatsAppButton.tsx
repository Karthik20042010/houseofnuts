import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/919652526920?text=Hi, I need help with House of Nuts"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[76px] md:bottom-6 left-4 md:left-6 z-[55] bg-[#25D366] hover:bg-[#1ebe57] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} className="fill-white" />
      <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs font-body font-medium px-3 py-1.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Chat with us
      </span>
    </a>
  );
};

export default WhatsAppButton;
