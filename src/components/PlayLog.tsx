import {ReactNode} from "react";

export function PlayLog(props: { isRemote?: boolean, children?: ReactNode, system?: boolean }) {
    return (
        <span style={{color: props.system ? '#882' : props.isRemote ? '#f22' : '#22f'}}>{props.children}</span>
    );
}