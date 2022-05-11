import { OverlayTrigger, Popover } from "react-bootstrap"
import { DataType } from "../DataContext/MasterDataType"
import { Plot } from "./PlotType"

export const GraphTooltip = (Plot: Plot, Data: DataType, Content: JSX.Element, reactKey: string, adminLvl: number) => {
    let regionName = Data["country_name"]

    if (adminLvl !== 0) {
        regionName = Data[`subregion${adminLvl}_name` as keyof DataType]
    }

    return (
        <OverlayTrigger placement="auto" key={reactKey} overlay={
            <Popover id="popover-contained">
                <Popover.Header as="h3">{regionName} at {Data["date"]}</Popover.Header>

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
