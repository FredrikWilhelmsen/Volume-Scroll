import { Settings, videoElements } from "../types";

const domains = [
    "music.youtube.com",
];

export function getVideo(): videoElements | null {
    return null;
}

export function handlesDomain(domain : string){
    return domains.includes(domain);
}