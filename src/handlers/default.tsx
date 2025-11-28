import { Settings, videoElements } from "../types";

export class DefaultHandler {
    protected domains: string[] = [];
    
    public getVideo(e: MouseEvent): videoElements | null {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        
        for (const element of elements) {
            if (element.tagName === "VIDEO") {
                const videoGroup : videoElements = { 
                    display: element as HTMLBaseElement, 
                    video: element as HTMLVideoElement
                }; 
    
                return videoGroup;
            }
        }
    
        return null;
    }

    public updateVolume(settings: Settings, video: HTMLVideoElement, direction: number): void {

    }

    public handlesDomain(domain : string): boolean {
        return this.domains.includes(domain);
    }
}