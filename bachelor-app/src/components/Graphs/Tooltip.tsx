import { OverlayTrigger, Popover } from "react-bootstrap"
import { DataType } from "../DataContext/MasterDataType"
import { Plot } from "./PlotType"

const SHOWCOUNTRY = false;

export const GraphTooltip = (Plot: Plot, Data: DataType, Content: JSX.Element) => {
    return (
        <OverlayTrigger placement="auto" overlay={
            <Popover id="popover-contained">
                {SHOWCOUNTRY ? <Popover.Header as="h3">Country Text</Popover.Header> : <></>

                }

                <Popover.Body>
                    <strong>{Plot.Axis[0].replace("_", " ")}:</strong> {Data[Plot.Axis[0]]}
                    <br />
                    <strong>{Plot.Axis[1].replace("_", " ")}:</strong> {Data[Plot.Axis[1]]}
                </Popover.Body>
            </Popover>
        }>
            {Content}
        </OverlayTrigger>
    )
}