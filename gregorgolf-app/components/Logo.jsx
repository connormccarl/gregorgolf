import { Image } from "@mantine/core";

export function Logo(props){
    return (
        <Image {...props}
            src="/text_logo_white.webp"
            alt="Gregor Private Golf Club"
        />
    );
}