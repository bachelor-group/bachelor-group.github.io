import { format } from "d3";
import { select } from "d3-selection";
import { DataType } from "../DataContext/MasterDataType";
import { FeatureData } from "./DrawMap";
import Translator from "./helpers";

interface MapToolTipProps {
    width: number,
    translator: Translator
    DataTypeProperty: keyof DataType
    divRef: React.MutableRefObject<null>
    scalePer100K: boolean
}

interface IMapToolTip {
    updateTooltipdiv(event: PointerEvent, data: FeatureData, show: boolean, dataType: keyof DataType): void
}

export class MapToolTip implements IMapToolTip {
    _translator: Translator;
    width: number;
    DataTypeProperty: keyof DataType;
    divRef: React.MutableRefObject<null>
    scalePer100K: boolean

    constructor({ width, translator, DataTypeProperty, divRef, scalePer100K }: MapToolTipProps) {
        this.divRef = divRef;
        this._translator = translator;
        this.width = width;
        this.DataTypeProperty = DataTypeProperty;
        this.scalePer100K = scalePer100K;
    }

    updateTooltipdiv(event: PointerEvent, data: FeatureData, show: boolean) {
        //Get Admin lvl
        let adminLvl = data.data.location_key?.split("_").length! - 1

        if (!show) {
            let test = select(this.divRef.current)
                .selectAll<SVGSVGElement, typeof data>("div")
            test.remove()
            return
        }

        // Default to have popover go on right side of click
        let popoverLocation: "end" | "start" = "end";
        if (event.offsetX > this.width / 2) popoverLocation = "start";

        // Select elements and data
        let toolTipDiv = select(this.divRef.current)
            .selectAll<SVGSVGElement, typeof data>("div")
            .data([data], d => this._translator.name(d.feature, adminLvl));

        // Append main div
        let toolTipDivEnterSelection = toolTipDiv.enter().append("div")
            .attr("class", `fade show popover bs-popover-${popoverLocation} `);

        // Append all child divs
        toolTipDivEnterSelection
            .append("div")
            .attr("class", "popover-arrow")
            .attr("style", () => "top: 0px; transform: translate(0px, 37px);");

        toolTipDivEnterSelection
            .append("div")
            .attr("class", "popover-header")
            .text(d => `${this._translator.name(d.feature, adminLvl)} `);

        toolTipDivEnterSelection
            .append("div")
            .attr("class", "popover-body")
            .html(d => {
                let html = "";
                let selectedData = d.data[this.DataTypeProperty]
                if (selectedData !== undefined) {
                    html = `<strong> ${this.DataTypeProperty.replaceAll("_", " ")}:</strong> ${selectedData.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`
                    if (this.scalePer100K){
                        html += `</br >
                        <strong>Per 100k:</strong> ${format(',.2f')(parseFloat(selectedData) / parseFloat(d.data.population!) * 100000).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} `
                    }
                } else {
                    html = "<strong>Insufficient Data</strong>"
                }
                return html;
            });

        // Translate the div to correct location. We wait so the div get its width from text. this ensures there is no wrapping
        toolTipDivEnterSelection
            .transition()
            .attr("style", `left: 0px; top: ${event.offsetY - 45}px; position: absolute; display: block; transform: translate(calc(${event.offsetX + (popoverLocation === "end" ? 1 : -1) * 8 * 2}px + ${popoverLocation === "end" ? 0 : -100}%), 0px)`);

        // Append main div
        let toolTipDivTransitionSelection = toolTipDiv
            .attr("class", `fade show popover bs-popover-${popoverLocation} `);


        // Append all child divs
        toolTipDivTransitionSelection
            .append("div")
            .attr("class", "popover-arrow")
            .attr("style", d => "top: 0px; transform: translate(0px, 37px);");

        toolTipDivTransitionSelection
            .append("div")
            .attr("class", "popover-header")
            .text(d => `${this._translator.name(d.feature, adminLvl)} `);

        toolTipDivTransitionSelection
            .append("div")
            .attr("class", "popover-body")
            .html(d => {
                let html = "";
                let selectedData = d.data[this.DataTypeProperty]
                if (selectedData !== undefined) {
                    html = `<strong> ${this.DataTypeProperty.replaceAll("_", " ")}:</strong> ${selectedData.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`
                    if (this.scalePer100K){
                        html += `</br >
                        <strong>Per 100k:</strong> ${format(',.2f')(parseFloat(selectedData) / parseFloat(d.data.population!) * 100000).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} `
                    }
                } else {
                    html = "<strong>Insufficient Data</strong>"
                }
                return html;
            });

        toolTipDivTransitionSelection
            .attr("style", `left: 0px; top: ${event.offsetY - 45}px; position: absolute; display: block; transform: translate(calc(${event.offsetX + (popoverLocation === "end" ? 1 : -1) * 8 * 2}px + ${popoverLocation === "end" ? 0 : -100}%), 0px)`);

        toolTipDiv.exit().remove()
    }

}

export default MapToolTip;
