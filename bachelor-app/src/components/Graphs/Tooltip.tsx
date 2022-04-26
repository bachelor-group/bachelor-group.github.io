import { OverlayTrigger, Popover } from "react-bootstrap"
import { DataType } from "../DataContext/MasterDataType"
import { Plot } from "./PlotType"

const SHOWCOUNTRY = false;

export const GraphTooltip = (Plot: Plot, Data: DataType, Content: JSX.Element) => {
    return (
        <OverlayTrigger placement="auto" overlay={
            <Popover id="popover-contained">
                {SHOWCOUNTRY ? <Popover.Header as="h3">{Data["country_name"]} at {Data["date"]}</Popover.Header> : <></>

                }

                <Popover.Body>
                    <strong>{Plot.Axis[0].replace("_", " ")}:</strong> {Data[Plot.Axis[0]]!.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                    <br />
                    <strong>{Plot.Axis[1].replace("_", " ")}:</strong> {Data[Plot.Axis[1]]!.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                </Popover.Body>
            </Popover>
        }>
            {Content}
        </OverlayTrigger>
    )
}