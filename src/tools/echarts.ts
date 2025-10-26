import { z } from "zod";
import { generateChartImage } from "../utils";
import { OutputTypeSchema } from "../utils/schema";

function isValidEChartsOption(option: any): boolean {
  try {
    if (typeof option !== "object" || option === null) {
      return false;
    }

    // Basic validation for common chart types that require axes
    if (option.series && Array.isArray(option.series)) {
      const hasCartesianSeries = option.series.some(
        (series: { type?: string }) =>
          series.type && ["bar", "line", "scatter"].includes(series.type),
      );

      // If chart has cartesian series, it should have proper axis configuration
      if (hasCartesianSeries && !option.xAxis && !option.yAxis) {
        console.error(
          "[DEBUG] Chart validation failed: Cartesian chart missing axis configuration",
        );
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export const generateEChartsTool = {
  name: "generate_echarts",
  description:
    "Generate visual charts using Apache ECharts with echarts option and configuration dynamically. Apache ECharts is an Open Source JavaScript Visualization Library, which is used to create interactive charts and visualizations in web applications. It supports a wide range of chart types, including line charts, bar charts, pie charts, scatter plots, and more. ECharts is highly customizable and can be integrated with various data sources to create dynamic visualizations.",
  inputSchema: z.object({
    echartsOption: z
      .union([
        z.string().transform((str) => {
          try {
            return JSON.parse(str);
          } catch {
            throw new Error("Invalid JSON string for echartsOption");
          }
        }),
        z.record(z.any()),
      ])
      .describe(
        `ECharts option and configuration used to generate charts. Can be either a JSON string or an object. For example:
{
  "title": {
    "text": "ECharts Entry Example",
    "left": "center",
    "top": "2%"
  },
  "tooltip": {},
  "xAxis": {
    "data": ["shirt", "cardigan", "chiffon", "pants", "heels", "socks"]
  },
  "yAxis": {},
  "series": [{
    "name": "Sales",
    "type": "bar",
    "data": [5, 20, 36, 10, 10, 20]
  }]
}

ATTENTION: A valid ECharts option must be a valid JSON object or string, and cannot be empty.
`,
      ),
    width: z
      .number()
      .min(
        50,
        "Width must be at least 50 pixels to ensure proper chart rendering",
      )
      .max(5000, "Width cannot exceed 5000 pixels")
      .describe("The width of the ECharts in pixels. Default is 800.")
      .optional()
      .default(800),
    height: z
      .number()
      .min(
        50,
        "Height must be at least 50 pixels to ensure proper chart rendering",
      )
      .max(5000, "Height cannot exceed 5000 pixels")
      .describe("The height of the ECharts in pixels. Default is 600.")
      .optional()
      .default(600),
    theme: z
      .enum(["default", "dark"])
      .describe("ECharts theme, optional. Default is 'default'.")
      .optional()
      .default("default"),
    outputType: OutputTypeSchema,
  }),
  run: async (params: {
    echartsOption: any; // Can be object or string (Zod will transform string to object)
    width?: number;
    height?: number;
    theme?: "default" | "dark";
    outputType?: "png" | "svg" | "option";
  }) => {
    const { width, height, echartsOption, theme, outputType } = params;

    // Debug logging (writes to stderr, won't interfere with MCP protocol)
    if (process.env.DEBUG_MCP_ECHARTS) {
      console.error("[DEBUG] ECharts tool called with params:", {
        echartsOptionType: typeof echartsOption,
        width,
        height,
        theme,
        outputType,
      });
    }

    if (!isValidEChartsOption(echartsOption)) {
      throw new Error(
        "Invalid ECharts option, a valid ECharts option must be a valid JSON object, and cannot be empty.",
      );
    }

    // echartsOption is already an object (Zod transformed it if it was a string)
    const option = echartsOption;

    // Use the unified image generation method
    return await generateChartImage(
      option,
      width,
      height,
      theme,
      outputType,
      "generate_echarts_chart",
    );
  },
};
