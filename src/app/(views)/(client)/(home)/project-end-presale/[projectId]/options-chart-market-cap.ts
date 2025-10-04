export const optionsChartMarketCap = {
  chart: {
    type: "area" as const,
    height: 400,
    toolbar: {
      show: false,
    },
    animations: {
      enabled: true,
      easing: "easeinout" as const,
      speed: 800,
    },
    zoom: {
      enabled: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth" as const,
    width: 2,
    colors: ["#ef4444"],
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0.1,
      stops: [0, 100],
      colorStops: [
        {
          offset: 0,
          color: "#ef4444",
          opacity: 0.3,
        },
        {
          offset: 100,
          color: "#ef4444",
          opacity: 0.1,
        },
      ],
    },
  },
  xaxis: {
    type: "datetime",
    labels: {
      format: "MMM yyyy",
      style: {
        colors: "#6b7280",
        fontSize: "12px",
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    grid: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      formatter: (value: number) => {
        if (value >= 1) {
          return `$${value.toFixed(0)}B`;
        }
        return `$${value.toFixed(1)}B`;
      },
      style: {
        colors: "#6b7280",
        fontSize: "12px",
      },
    },
    min: 0,
    max: 5,
    tickAmount: 6,
  },
  grid: {
    show: true,
    borderColor: "#e5e7eb",
    strokeDashArray: 0,
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  colors: ["#ef4444"],
  tooltip: {
    enabled: true,
    x: {
      format: "MMM dd, yyyy",
    },
    y: {
      formatter: (value: number) => `$${value.toFixed(2)}B`,
    },
    style: {
      fontSize: "12px",
    },
  },
  legend: {
    show: true,
    position: "bottom" as const,
    horizontalAlign: "left" as const,
    fontSize: "12px",
    markers: {
      width: 8,
      height: 8,
      radius: 4,
    },
    itemMargin: {
      horizontal: 20,
      vertical: 0,
    },
  },
  annotations: {
    text: [
      {
        text: "RWA.io",
        x: 0.5,
        y: 0.5,
        textAnchor: "middle",
        fontSize: "48px",
        fontWeight: "bold",
        color: "#f3f4f6",
        opacity: 0.3,
      },
    ],
  },
};
