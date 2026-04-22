import { useState } from "react";
import { MapPin, Navigation, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface LocationPickerProps {
  onLocationChange: (link: string) => void;
}

export function LocationPicker({ onLocationChange }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState("");

  const handleGetLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Seu navegador não suporta geolocalização.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
        onLocationChange(link);
        setLoading(false);
        setError("Localização capturada com sucesso! ✅");
      },
      (error) => {
        setLoading(false);
        setError("Não foi possível pegar a localização. Por favor, insira o link manualmente.");
      }
    );
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualLink(e.target.value);
    onLocationChange(e.target.value);
  };

  return (
    <div className="space-y-4 bg-store-light p-4 rounded-xl border border-rose-100 mt-4">
      <div className="flex items-start gap-2 text-store-dark mb-2">
        <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Localização exata</h4>
          <p className="text-xs opacity-90">Isso ajuda a gente a entregar mais rápido e sem erros 💖</p>
        </div>
      </div>

      <Button 
        type="button" 
        onClick={handleGetLocation} 
        disabled={loading}
        className="w-full bg-store-dark hover:bg-rose-600 text-white rounded-xl h-12 shadow-sm"
      >
        <Navigation className="w-4 h-4 mr-2" />
        {loading ? "Capturando..." : "👉 Usar minha localização atual"}
      </Button>

      {error && !error.includes("sucesso") && (
        <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
      {error && error.includes("sucesso") && (
        <div className="text-xs text-green-600 font-medium mt-1">
          {error}
        </div>
      )}

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="shrink-0 mx-4 text-xs text-gray-400 font-medium uppercase">ou</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 block">
          👉 Ou colar link da localização do Google Maps
        </label>
        <Input 
          type="url"
          placeholder="Cole aqui o link do Maps"
          value={manualLink}
          onChange={handleManualChange}
          className="bg-white border-rose-200 rounded-xl"
        />
        <p className="text-[10px] text-gray-500">
          Abra o Google Maps, segure no local da sua casa e copie o link.
        </p>
      </div>
    </div>
  );
}
