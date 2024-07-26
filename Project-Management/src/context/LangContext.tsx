import React, { createContext, useState, useContext } from "react";

type LangContextType = {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
};

const LangContext = createContext<LangContextType | undefined>(undefined);

type LangProviderProps = {
  children: React.ReactNode;
};

export const LangProvider: React.FC<LangProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState("en");

  return (
    <LangContext.Provider value={{ language, setLanguage }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = (): LangContextType => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLang must be used within a LangProvider");
  }
  return context;
};
