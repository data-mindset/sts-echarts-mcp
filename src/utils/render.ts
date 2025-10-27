import path from "node:path";
import fs from "node:fs";
import { GlobalFonts, createCanvas } from "@napi-rs/canvas";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

// Font will be copied to .smithery/fonts/ during build via postbuild script
const fontPath = path.join(__dirname, "fonts", "Roboto-Regular.ttf");

// Register font with specific family name "Roboto"
try {
  if (fs.existsSync(fontPath)) {
    GlobalFonts.registerFromPath(fontPath, "Roboto");
  }
} catch (error) {
  // Font loading failed - charts will render without text
}

/**
 * Render ECharts chart, return Buffer or string
 * This is a pure function that doesn't handle storage logic
 */
export async function renderECharts(
  echartsOption: EChartsOption,
  width = 800,
  height = 600,
  theme = "default",
  outputType: "png" | "svg" | "option" = "png",
): Promise<Buffer | string> {
  if (outputType === "svg" || outputType === "option") {
    const chart = echarts.init(null, theme, {
      renderer: "svg",
      ssr: true,
      width,
      height,
    });

    // Inject font configuration for SVG rendering
    const optionsWithFont = {
      ...echartsOption,
      animation: false,
      textStyle: {
        fontFamily: "Roboto",
        ...(echartsOption.textStyle || {}),
      },
    };

    chart.setOption(optionsWithFont);

    // Output string
    const svgStr = chart.renderToSVGString();

    // If the chart is no longer needed, call dispose to free memory
    chart.dispose();
    // Return SVG string or validated ECharts configuration options
    return outputType === "svg"
      ? svgStr
      : JSON.stringify(echartsOption, null, 2);
  }

  // Other output types (such as PNG) need to use Canvas
  const canvas = createCanvas(width, height) as unknown as HTMLCanvasElement;
  const chart = echarts.init(canvas, theme, {
    devicePixelRatio: 3,
  });

  echarts.setPlatformAPI({
    loadImage(src, onload, onerror) {
      const img = new Image();
      img.onload = onload.bind(img);
      img.onerror = onerror.bind(img);
      img.src = src;
      return img;
    },
  });

  // Inject font configuration into the chart options
  const optionsWithFont = {
    ...echartsOption,
    animation: false,
    textStyle: {
      fontFamily: "Roboto",
      ...(echartsOption.textStyle || {}),
    },
    title: {
      ...(echartsOption.title || {}),
      textStyle: {
        fontFamily: "Roboto",
        ...((echartsOption.title as any)?.textStyle || {}),
      },
    },
    xAxis: Array.isArray(echartsOption.xAxis)
      ? echartsOption.xAxis.map((axis) => ({
          ...axis,
          axisLabel: {
            fontFamily: "Roboto",
            ...(axis.axisLabel || {}),
          },
        }))
      : {
          ...(echartsOption.xAxis || {}),
          axisLabel: {
            fontFamily: "Roboto",
            ...((echartsOption.xAxis as any)?.axisLabel || {}),
          },
        },
    yAxis: Array.isArray(echartsOption.yAxis)
      ? echartsOption.yAxis.map((axis) => ({
          ...axis,
          axisLabel: {
            fontFamily: "Roboto",
            ...(axis.axisLabel || {}),
          },
        }))
      : {
          ...(echartsOption.yAxis || {}),
          axisLabel: {
            fontFamily: "Roboto",
            ...((echartsOption.yAxis as any)?.axisLabel || {}),
          },
        },
    legend: {
      ...(echartsOption.legend || {}),
      textStyle: {
        fontFamily: "Roboto",
        ...((echartsOption.legend as any)?.textStyle || {}),
      },
    },
  };

  chart.setOption(optionsWithFont);

  // @ts-ignore
  const buffer = canvas.toBuffer("image/png");

  chart.dispose();

  return buffer;
}
