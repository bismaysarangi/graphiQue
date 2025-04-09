import { Edit, Layers, Bot, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Features() {
  const navigate = useNavigate();

  const features = [
    { icon: Edit, title: "Edit Image", desc: "Smart adjustment tools for quick, professional enhancements.", color: "text-purple-400", path: "/edit-image" },
    { icon: Brain, title: "AI Image Enhancer", desc: "Automatically improve clarity, colors, and sharpness for flawless photos.", color: "text-red-400", path: "https://graphique-image-enhancer.netlify.app/" },
    { icon: Bot, title: "AI Background Editor", desc: "Smart background editing with one click—no manual selection needed.", color: "text-green-400", path: "https://ai-image-editor-cap.netlify.app/" },
    { icon: Layers, title: "Paint Zone", desc: "Create complex compositions with our powerful layering system.", color: "text-blue-400", path: "/paint-zone" }
  ];

  return (
    <section id="features" className="w-full py-20 md:py-28 lg:py-32 bg-black">
      <div className=" px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-white">Powerful Features</h2>
        <p className="text-gray-400 md:text-xl lg:text-2xl">
          Professional-grade tools in a seamless, intuitive platform.
        </p>
        <div className="grid max-w-6xl mx-auto gap-6 lg:grid-cols-4 mt-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center space-y-4 bg-gray-900 p-6 rounded-lg hover:bg-gray-800 cursor-pointer"
              onClick={() => {
                if (feature.path.startsWith("http")) {
                  window.open(feature.path, "_blank", "noopener,noreferrer"); // External link (new tab)
                } else if (feature.path !== "#") {
                  navigate(feature.path); // Internal link
                  window.scrollTo(0, 0);
                }
              }}
            >
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