"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { AppSidebar } from "@/app/page/admin/components/Slider";
import AdminNavbar from "@/app/page/admin/components/admin-navbar";
import LineChartOne from "@/app/page/admin/dashboard/line-char";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

export default function BarChartOne() {
    const options: ApexOptions = {
        colors: ["#465fff"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 180,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "39%",
                borderRadius: 5,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 4,
            colors: ["transparent"],
        },
        xaxis: {
            categories: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit",
        },
        yaxis: {
            title: {
                text: undefined,
            },
        },
        grid: {
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        fill: {
            opacity: 1,
        },

        tooltip: {
            x: {
                show: false,
            },
            y: {
                formatter: (val: number) => `${val}`,
            },
        },
    };
    const series = [
        {
            name: "Sales",
            data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
        },
    ];
    return (
        <div className="flex w-full">
            <div className="w-23">
                <AppSidebar />
            </div>

            <div className="flex flex-col w-full">

                <div className="mx-12">
                    <AdminNavbar />
                </div>
                

                <div className="flex justify-center items-center">

                    <div id="chartOne" className="w-[600px] mx-5 mt-24 border-1">
                        <ReactApexChart
                            options={options}
                            series={series}
                            type="bar"
                            height={210}
                        />
                    </div>

                    <div id="LineOne" className="w-[600px] mx-4 mt-24 border-1">
                        <LineChartOne />
                    </div>

                </div>

                
            </div>
           
        </div>
    );
}