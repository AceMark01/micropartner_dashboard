export interface SheetUser {
    Consigneename?: string;
    ConsigneeName?: string;
    "Consignee Name"?: string;
    ID: string;
    Password: string;
    [key: string]: string | undefined;
}

export interface SheetDataRaw {
    Year: string;
    Month: string;
    AccountName: string;
    AccountBeat?: string;
    BaseCat?: string;
    Consignee?: string;
    Employee?: string;
    [key: string]: string | undefined;
}

export interface MicropartnerData {
    year: string;
    month: string;
    accountName: string;
    accountBeat: string;
    baseCat: string;
    consignee: string;
    employee: string;
    totalAmt: number;
    // Add other fields as necessary
}

export async function fetchSheetData<T = any>(sheetName: string): Promise<T[]> {
    const url = `/api/sheet?sheet=${encodeURIComponent(sheetName)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch sheet: ${response.statusText}`);
        }
        const data = await response.json();

        return data as T[];
    } catch (error) {
        console.error(`Error fetching sheet "${sheetName}":`, error);
        return [];
    }
}

export async function fetchUsers(): Promise<SheetUser[]> {
    return fetchSheetData<SheetUser>('Master');
}

export async function fetchDashboardData(): Promise<MicropartnerData[]> {
    const rawData = await fetchSheetData<SheetDataRaw>('CancelOrder(consignee)');

    // Transform raw data to match the app's internal structure
    return rawData.map(row => ({
        year: (row.Year || '').trim(),
        month: (row.Month || '').trim(),
        accountName: (row.AccountName || '').trim(),
        accountBeat: (row.AccountBeat || '').trim(), // For 'Beatwise' status
        baseCat: (row.BaseCat || '').trim(),         // For 'BaseCat' status
        consignee: (row.Consigneename || row.Consignee || row.ConsigneeName || '').trim(), // Try all variations
        employee: (row.EmployeeName || row.Employee || '').trim(),
        totalAmt: parseFloat((row['Total Amount'] || row['Amount'] || row['TotalAmt'] || row['Net Amount'] || '0').replace(/[^0-9.-]+/g, '')) || 0,
        // If there is an amount column, we should map it.
    }));
}
