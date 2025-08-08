
export interface Sidebarmenu {
    title:string;
    path:string;
    icon: string;
    submenu?:boolean,
    submenuitems?:Sidebarmenu[];

}