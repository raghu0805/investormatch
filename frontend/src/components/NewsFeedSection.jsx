import { motion } from "framer-motion";

export default function NewsFeedSection() {
  const feed = [
    {
      title: "HealthAI raises $2M seed funding from RedDot Ventures",
      desc: "AI-powered diagnostics startup expands predictive health models.",
      country: "Singapore",
      img: "https://images.pexels.com/photos/3952248/pexels-photo-3952248.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
    },
    {
      title: "GreenCharge partners with Tesla-backed fund",
      desc: "Sustainable battery startup secures $10M Series A to scale operations.",
      country: "USA",
      img: "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
    },
    {
      title: "AgroNext gets ₹3 Crore investment from IAN",
      desc: "AgriTech platform revolutionizing supply chains gains strong investor support.",
      country: "India",
      img: "https://images.pexels.com/photos/4144065/pexels-photo-4144065.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
    },
    {
      title: "FinPay collaborates with Tokyo Capital",
      desc: "FinTech startup offering instant payments bags strategic Japanese investment.",
      country: "Japan",
      img: "https://images.pexels.com/photos/267614/pexels-photo-267614.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
    }
  ];

  return (
    <div className="w-full mt-20 pb-20">
      <h2 className="text-center text-3xl font-bold text-red-500 mb-10">
        Global Startup & Investor Highlights
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
        {feed.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            viewport={{ once: true }}
            className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg hover:shadow-red-900/40 transition"
          >
            {/* IMAGE */}
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-40 object-cover opacity-90 hover:opacity-100 transition"
            />

            {/* CONTENT */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{item.desc}</p>
              <span className="text-red-400 text-sm font-medium">{item.country}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
