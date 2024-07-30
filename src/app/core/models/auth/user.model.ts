import { Permission } from "./permission.model";

export class User {
    id?: number;
    username: string;
    password: string;
    names: string;
    firstLastName: string;
    secondLastName?: string;
    fullName?: string;
    employeeId?: string;
    permissions: Permission[];
    permissionIds?: number[];
    status: boolean;

    constructor() {
        this.fullName = this.names + " " + this.firstLastName + " " + this.secondLastName;
    }
}