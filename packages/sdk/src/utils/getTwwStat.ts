import { Unit, Version } from "../types";

export function getTwwStatUrl(unitAndVersion: {unit: Unit, version: Version}[]) {  
    let url = `https://twwstats.com/unitscards?`;
    const units = unitAndVersion.map(unitAndVersion => {
        return 'units=f' + encodeURIComponent(`=0&k=${unitAndVersion.unit.unit}&v=${unitAndVersion.version.id}&m&r=0`);
    }).join('&');
    return url + units;
}