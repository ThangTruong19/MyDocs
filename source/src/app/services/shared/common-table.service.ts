import { Injectable } from '@angular/core';
import { TableHeader } from 'app/types/common';

@Injectable()
export class CommonTableService {

    public isDisplayDataRow(tableHeader: TableHeader, listData: any,
        isMergeRows: boolean): boolean {
        if (tableHeader.displayable) {
            if (!isMergeRows) {
                return true;
            } else if ((isMergeRows && !(listData.view && listData.view.displayNoneRow
                && listData.view.displayNoneRow[tableHeader.dataKey || tableHeader.name]))) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    public getDataRowspan(tableHeader: TableHeader, listData: any,
        isMergeRows: boolean): string {
        if (tableHeader.displayable) {
            if (isMergeRows && listData.view && listData.view.rowspan) {
                return listData.view.rowspan[tableHeader.dataKey || tableHeader.name];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public getColumnStyle(tableHeader: TableHeader): string {
        if (tableHeader.displayable) {
            if (tableHeader.columnStyle) {
                return tableHeader.columnStyle;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public getSimpleTableRowCss(isMergeRows: boolean): string {
        if (isMergeRows) {
            return 'app-table-flex-cell-merge-rows';
        } else {
            return 'app-table-flex-cell';
        }
    }

    public getSimpleTableDataColumnCss(isMergeRows: boolean): string {
        if (isMergeRows) {
            return 'merge-col-d-flex';
        } else {
            return 'd-flex';
        }
    }

    public isDisplayFixedDataRow(listData: any, isMergeRows: boolean): boolean {
        if (!isMergeRows) {
            return true;
        } else if (isMergeRows && !(listData.view && listData.view.displayNoneRow
            && listData.view.displayNoneRow.fixedColumn)) {
            return true;
        } else {
            return false;
        }
    }

    public getFixedDataRowspan(listData: any, isMergeRows: boolean): string {
        if (isMergeRows && listData.view && listData.view.rowspan
            && listData.view.rowspan.fixedColumn) {
            return listData.view.rowspan.fixedColumn;
        } else {
            return null;
        }
    }

    public getArrayColumnData(data: any, pathName: string): any[] {
        let fetchData: any = data;
        const splitPathName = pathName.split('.');
        for (let i = 0; splitPathName.length; i++) {
            const path: string = splitPathName[i];
            fetchData = fetchData[path];
            if (!fetchData) {//console.log('or here?');
                return [];
            } else if ((fetchData && Array.isArray(fetchData))) {
                return fetchData;
            }
        }//console.log('here?');
        return [];
    }

    public getLastColumnPathName(pathName: string): string {
        const index = pathName.lastIndexOf('.');
        if (index != -1) {
            return pathName.substring(index + 1);
        } else {
            return pathName;
        }
    }

}
