import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Clock, Truck, Zap, Activity } from "lucide-react";
import api from "../services/api";
import { formatDuration } from "../utils/formatter";

// ── Insight generator ──────────────────────────────────────
const generateInsights = (data) => {
  const insights = [];

  if (data.avgWaitTime < 30) {
    insights.push({
      type: "success",
      text: "Excellent scheduling — average wait time under 30 seconds.",
    });
  } else if (data.avgWaitTime < 120) {
    insights.push({
      type: "warning",
      text: `Average wait time is ${formatDuration(data.avgWaitTime)} — acceptable but could improve with more docks.`,
    });
  } else {
    insights.push({
      type: "danger",
      text: `High average wait time of ${formatDuration(data.avgWaitTime)} — too few docks for this arrival rate.`,
    });
  }

  if (data.avgDockUtilization > 85) {
    insights.push({
      type: "warning",
      text: `Dock utilization at ${data.avgDockUtilization}% — docks are overloaded. Consider adding more.`,
    });
  } else if (data.avgDockUtilization < 40) {
    insights.push({
      type: "warning",
      text: `Low dock utilization at ${data.avgDockUtilization}% — too many docks for this traffic volume.`,
    });
  } else {
    insights.push({
      type: "success",
      text: `Dock utilization at ${data.avgDockUtilization}% — operating in optimal range.`,
    });
  }

  if (data.avgWaitByPriority.high === 0 && data.avgWaitByPriority.low === 0) {
    insights.push({
      type: "warning",
      text: "Not enough data to evaluate priority scheduling — run longer simulation.",
    });
  } else if (data.avgWaitByPriority.high <= data.avgWaitByPriority.low) {
    insights.push({
      type: "success",
      text: "Priority scheduling working correctly — high priority trucks waited less than low priority.",
    });
  } else {
    insights.push({
      type: "danger",
      text: "Priority scheduling issue — high priority trucks are not being served first.",
    });
  }

  if (data.totalDelays > data.totalTrucks * 0.3) {
    insights.push({
      type: "danger",
      text: `High delay rate — ${data.totalDelays} out of ${data.totalTrucks} trucks were delayed.`,
    });
  } else {
    insights.push({
      type: "success",
      text: `Low delay impact — only ${data.totalDelays} delays across ${data.totalTrucks} trucks.`,
    });
  }

  return insights;
};

const insightStyle = {
  success: "border-green-500/30 bg-green-500/10 text-green-400",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  danger: "border-red-500/30 bg-red-500/10 text-red-400",
};

// ── Metric card ────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-gray-500 text-sm">{label}</span>
      <Icon size={18} className={color} />
    </div>
    <p className="text-white text-2xl font-bold">{value}</p>
    {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
  </div>
);

// ── Main page ──────────────────────────────────────────────
const Analytics = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/simulation/sessions").then((res) => {
      setSessions(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedId(res.data.data[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    api
      .get(`/simulation/sessions/${selectedId}`)
      .then((res) => {
        // console.log('Analytics data:', res.data.data);
        // console.log('Comparison data:', res?.data?.data);
        setData(res.data.data);
      })
      .finally(() => setLoading(false));
  }, [selectedId]);

  const insights = data ? generateInsights(data) : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">
            Post-session performance breakdown
          </p>
        </div>

        {/* Session selector */}
        <select
          value={selectedId || ""}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
        >
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>
              Session — {new Date(s.createdAt).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {data && (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              icon={Clock}
              label="Avg Wait Time"
              value={formatDuration(data.avgWaitTime)}
              sub="per truck"
              color="text-blue-400"
            />
            <MetricCard
              icon={Zap}
              label="Throughput"
              value={`${data.throughputRate}/min`}
              sub="trucks completed"
              color="text-yellow-400"
            />
            <MetricCard
              icon={Activity}
              label="Dock Utilization"
              value={`${data.avgDockUtilization}%`}
              sub="avg across docks"
              color="text-green-400"
            />
            <MetricCard
              icon={Truck}
              label="Completed"
              value={`${data.completedTrucks}/${data.totalTrucks}`}
              sub={`${data.totalDelays} delays`}
              color="text-purple-400"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Wait time distribution */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">
                Wait Time Distribution
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.waitTimeDistribution}>
                  <XAxis
                    dataKey="range"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Avg wait by priority */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">
                Avg Wait by Priority
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[
                    {
                      priority: "HIGH",
                      wait: Math.round(data.avgWaitByPriority.high),
                    },
                    {
                      priority: "MEDIUM",
                      wait: Math.round(data.avgWaitByPriority.medium),
                    },
                    {
                      priority: "LOW",
                      wait: Math.round(data.avgWaitByPriority.low),
                    },
                  ]}
                >
                  <XAxis
                    dataKey="priority"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="wait" radius={[4, 4, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Dock utilization */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 col-span-2">
              <h3 className="text-white font-semibold mb-4">
                Dock Utilization
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.dockUtilization} layout="vertical">
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    unit="%"
                  />
                  <YAxis
                    dataKey="dockId"
                    type="category"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(v) => [`${Math.round(v)}%`, "Utilization"]}
                  />
                  <Bar
                    dataKey="utilization"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights */}
          <div>
            <h3 className="text-white font-semibold mb-3">System Insights</h3>
            <div className="grid grid-cols-2 gap-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`border rounded-lg px-4 py-3 text-sm ${insightStyle[insight.type]}`}
                >
                  {insight.text}
                </div>
              ))}
            </div>
          </div>
          {/* Comparison */}
          {data.comparison && data.comparison.fifoAvgWaitTime > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">
                Scheduler vs FIFO Comparison
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <p className="text-gray-500 text-sm mb-4">Average Wait Time</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-blue-400">Our Scheduler</span>
                        <span className="text-white font-bold">
                          {formatDuration(data.avgWaitTime)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min((data.avgWaitTime / data.comparison.fifoAvgWaitTime) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">FIFO (no priority)</span>
                        <span className="text-white font-bold">
                          {formatDuration(data.comparison.fifoAvgWaitTime)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full">
                        <div className="h-2 bg-gray-600 rounded-full w-full" />
                      </div>
                    </div>
                    <p className="text-green-400 text-sm font-semibold">
                      ✓ Saved {formatDuration(data.comparison.waitTimeSaved)} per truck on average
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <p className="text-gray-500 text-sm mb-4">High Priority Truck Wait Time</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-blue-400">Our Scheduler</span>
                        <span className="text-white font-bold">
                          {formatDuration(data.avgWaitByPriority.high)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{
                            width: `${data.comparison.fifoHighPriorityWait > 0 ? Math.min((data.avgWaitByPriority.high / data.comparison.fifoHighPriorityWait) * 100, 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">FIFO (no priority)</span>
                        <span className="text-white font-bold">
                          {formatDuration(data.comparison.fifoHighPriorityWait)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full">
                        <div className="h-2 bg-gray-600 rounded-full w-full" />
                      </div>
                    </div>
                    <p className="text-green-400 text-sm font-semibold">
                      ✓ Saved {formatDuration(data.comparison.priorityWaitSaved)} for urgent shipments
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!data && !loading && (
        <p className="text-gray-600">
          No session selected or no data available. Run a simulation first.
        </p>
      )}
    </div>
  );
};

export default Analytics;