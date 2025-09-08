import { CloudSun, Moon, Sun } from "lucide-react";
import React from "react";

interface GreetingProps {
  name: string;
}

function getGreetingAndIcon(): { greeting: string; icon: React.ReactNode } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12)
    return {
      greeting: "Buenos días",
      icon: <Sun className="h-6 w-6 text-yellow-400 mr-2" />,
    };
  if (hour >= 12 && hour < 20)
    return {
      greeting: "Buenas tardes",
      icon: <CloudSun className="h-6 w-6 text-orange-400 mr-2" />,
    };
  return {
    greeting: "Buenas noches",
    icon: <Moon className="h-6 w-6 text-purple-500 mr-2" />,
  };
}

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const Greeting: React.FC<GreetingProps> = ({ name }) => {
  const { greeting, icon } = getGreetingAndIcon();
  return (
    <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 shadow fade-in">
      {icon}
      <span className="text-lg font-semibold text-purple-700">
        {greeting}, <span className="text-pink-600">{capitalize(name)}</span>{" "}
        <span className="ml-1">😊</span>
      </span>
    </div>
  );
};
