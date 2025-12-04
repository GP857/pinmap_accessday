import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type ComparisonMode = "today-yesterday" | "3-days";

export default function AccessChart() {
  const [, setLocation] = useLocation();
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("today-yesterday");
  const [showWeekdayAverage, setShowWeekdayAverage] = useState(false);
  const [showAllDaysAverage, setShowAllDaysAverage] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [customDate, setCustomDate] = useState<string>("");

  const { data: comparativeData, refetch: refetchComparative } =
    trpc.access.getComparativeData.useQuery({
      referenceDate: customDate || undefined,
    });

  const { data: weekdayAverage, refetch: refetchWeekday } =
    trpc.access.getWeekdayAverage.useQuery({ weeks: 4 });

  const { data: allDaysAverage, refetch: refetchAllDays } =
    trpc.access.getAllDaysAverage.useQuery({ weeks: 4 });

  useEffect(() => {
    const interval = setInterval(() => {
      refetchComparative();
      refetchWeekday();
      refetchAllDays();
      setLastUpdate(new Date());
    }, 5 * 60 * 1000); // Atualiza a cada 5 minutos
    return () => clearInterval(interval);
  }, [refetchComparative, refetchWeekday, refetchAllDays]);

  const chartData = {
    // 48 labels: 0h, |, 1h, |, 2h, |... (| representa 30min)
    labels: Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const is30min = i % 2 === 1;
      return is30min ? "|" : `${hour}h`;
    }),
    datasets: (() => {
      const datasets = [];
      if (!comparativeData) return [];

      if (comparisonMode === "today-yesterday" || comparisonMode === "3-days") {
        // Limitar dados de "Hoje" até a hora e minuto atuais
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentSlot = currentHour * 2 + (currentMinute >= 30 ? 1 : 0);
        
        const todayData = comparativeData.today.map((d, index) => {
          return index > currentSlot ? null : d.accessCount;
        });
        
        datasets.push({
          label: "Hoje",
          data: todayData,
          borderColor: "rgb(22, 163, 74)",
          backgroundColor: "rgba(22, 163, 74, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          spanGaps: false, // Não conectar pontos com valores null
        });
      }

      if (comparisonMode === "today-yesterday" || comparisonMode === "3-days") {
        datasets.push({
          label: "Ontem",
          data: comparativeData.yesterday.map((d) => d.accessCount),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        });
      }

      if (comparisonMode === "3-days") {
        datasets.push({
          label: "Anteontem",
          data: comparativeData.dayBeforeYesterday.map((d) => d.accessCount),
          borderColor: "rgb(0, 0, 0)",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        });
      }

      if (showWeekdayAverage && weekdayAverage) {
        datasets.push({
          label: "Média Segunda a Sexta",
          data: weekdayAverage.map((d) => d.accessCount),
          borderColor: "rgb(220, 38, 38)",
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderDash: [5, 5],
        });
      }

      if (showAllDaysAverage && allDaysAverage) {
        datasets.push({
          label: "Média Todos os Dias",
          data: allDaysAverage.map((d) => d.accessCount),
          borderColor: "rgb(147, 51, 234)",
          backgroundColor: "rgba(147, 51, 234, 0.1)",
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderDash: [10, 5],
        });
      }

      return datasets;
    })(),
  };

  const calculatePercentages = () => {
    if (!comparativeData) return [];
    const percentages = [];
    for (let i = 0; i < 24; i++) {
      const today = comparativeData.today[i].accessCount;
      const yesterday = comparativeData.yesterday[i].accessCount;
      if (yesterday === 0) {
        percentages.push({ hour: i, percentage: today > 0 ? 100 : 0, isGain: today > 0 });
      } else {
        const percentage = ((today - yesterday) / yesterday) * 100;
        percentages.push({ hour: i, percentage: Math.round(percentage), isGain: percentage >= 0 });
      }
    }
    return percentages;
  };

  const percentages = calculatePercentages();

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const, labels: { font: { size: 14, weight: "bold" }, padding: 20 } },
      title: { display: true, text: "Comparativo de Acessos Hora a Hora", font: { size: 20, weight: "bold" }, padding: { top: 10, bottom: 30 } },
      tooltip: { mode: "index", intersect: false, backgroundColor: "rgba(0, 0, 0, 0.8)", titleFont: { size: 14, weight: "bold" }, bodyFont: { size: 13 }, padding: 12, displayColors: true },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Número de Acessos", font: { size: 14, weight: "bold" } }, grid: { color: "rgba(0, 0, 0, 0.1)" } },
      x: { title: { display: true, text: "Hora do Dia", font: { size: 14, weight: "bold" } }, grid: { color: "rgba(0, 0, 0, 0.05)" } },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Painel de Acessos Hora a Hora</h1>
              <p className="text-sm text-gray-600">Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")} | Próxima em 5 minutos</p>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <label htmlFor="customDate" className="text-sm font-semibold text-gray-700">Data:</label>
                <input
                  id="customDate"
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {customDate && (
                  <button
                    onClick={() => setCustomDate("")}
                    className="text-xs bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 py-1 rounded"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <button onClick={() => setComparisonMode("today-yesterday")} className={`px-4 py-2 rounded-lg font-semibold transition-all ${comparisonMode === "today-yesterday" ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>Hoje x Ontem</button>
              <button onClick={() => setComparisonMode("3-days")} className={`px-4 py-2 rounded-lg font-semibold transition-all ${comparisonMode === "3-days" ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>3 Dias</button>
              <button onClick={() => setShowWeekdayAverage(!showWeekdayAverage)} className={`px-4 py-2 rounded-lg font-semibold transition-all ${showWeekdayAverage ? "bg-red-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>Média Segunda a Sexta</button>
              <button onClick={() => setShowAllDaysAverage(!showAllDaysAverage)} className={`px-4 py-2 rounded-lg font-semibold transition-all ${showAllDaysAverage ? "bg-purple-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>Média Todos os Dias</button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div style={{ height: "350px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Variação Percentual Hoje x Ontem</h2>
          <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-24 gap-2">
            {percentages.map((p) => (
              <div key={p.hour} className={`text-center p-1.5 rounded font-bold text-xs ${p.isGain ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}>
                <div className="text-[10px] font-semibold mb-0.5">{p.hour}h</div>
                <div className="text-xs">{p.isGain ? "+" : ""}{p.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
