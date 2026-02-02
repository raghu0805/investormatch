import { motion } from "framer-motion";

export default function NewsFeedSection({ news }) {
  if (!news || !Array.isArray(news) || news.length === 0) return null;

  return (
    <div className="w-full mt-20 pb-20">
      <h2 className="text-center text-3xl font-bold text-red-500 mb-10">
        Global Startup & Investor Highlights
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
        {news.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-xl group"
            onClick={() => window.open(item.link || item.url, "_blank")}
          >
            <img
              src={item.image || "https://via.placeholder.com/400x300?text=News"}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>

            <div className="absolute bottom-0 p-5 text-white w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-red-400 font-semibold bg-black/50 px-2 py-1 rounded">
                  {item.source}
                </span>
                {item.date && (
                  <span className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight">
                {item.title}
              </h3>

              <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}

      </div>
    </div>
  );
}
