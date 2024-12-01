import { Chart } from "angular-highcharts";
import { kpi_kpiDetails, kpi } from "../models/kpi";
import { kpidetails } from "../models/kpi-details";

export class ChartsCtrl {
    public GetChart(kpidetails: kpi_kpiDetails): Chart {
        let kpi = kpidetails.kpi[0];
        let details = kpidetails.kpidetails;

        let kpivalues: number[] = [];
        let kpidates: string[] = [];
        for (let i of details) {
            kpivalues.push(i.kpI_ACTUAL);
            kpidates.push(i.period.toDateString());
        }

        return new Chart({
            chart: {
                type: kpi.charT_TYPE
            },
            title: {
                text: kpi.servicE_AREA + " : " + kpi.kpI_NAME
            },
            credits: {
                enabled: false
            },
            series: [
                {
                    name: kpi.supporT_WINDOW,
                    data: kpivalues,
                }
            ],
            xAxis: {
                categories: kpidates
            }
        });
    }
}
