import ReactGA from "react-ga4";

// Inicializa Google Analytics con ID de medición
export const initAnalytics = () => {
  ReactGA.initialize("G-KW92NL701C"); 
};

// Función para registrar eventos
export const trackEvent = (category, action, label) => {
  ReactGA.event({
    category,
    action,
    label
  });
};
