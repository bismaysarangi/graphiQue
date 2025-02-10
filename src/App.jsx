import React from "react";
import PaintZone from "./pages/PaintZone";
import EditImage from "./pages/EditImage";
import { Edit } from "lucide-react";

const App = () => {
  return <div className="">
    <EditImage />
    <PaintZone />
  </div>;
};

export default App;
