import { Edit, Layers, Share2 } from "lucide-react";

export default function Features() {
  const features = [
    { icon: Edit, title: "Intuitive Editing", desc: "Smart adjustment tools for quick, professional enhancements.", color: "text-purple-400" },
    { icon: Layers, title: "Advanced Layering", desc: "Create complex compositions with our powerful layering system.", color: "text-blue-400" },
    { icon: Share2, title: "Seamless Sharing", desc: "Export and share your creations directly to social media.", color: "text-green-400" },
  ];

  return (
    <section id="features" className="w-full py-20 md:py-28 lg:py-32 bg-black">
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-white">Powerful Features</h2>
        <p className="text-gray-400 md:text-xl lg:text-2xl">
          Professional-grade tools in a seamless, intuitive platform.
        </p>
        <div className="grid max-w-5xl mx-auto gap-12 lg:grid-cols-3 mt-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center space-y-4 bg-gray-900 p-6 rounded-lg hover:bg-gray-800">
              <feature.icon className={`h-12 w-12 ${feature.color}`} />
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-gray-400 text-center">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
