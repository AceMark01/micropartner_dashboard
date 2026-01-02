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
            const errorText = await response.text();
            throw new Error(`Failed to fetch sheet: ${response.status} ${response.statusText} - ${errorText}`);
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
    }));
}

export async function fetchIndirectSaleData(): Promise<MicropartnerData[]> {
    const rawData = await fetchSheetData<any>('Retailer Under Micro (Indirect Sale)');

    return rawData.map(row => {
        // Parse date from VoucherDate "2025-01-04 0:00"
        let year = '';
        let month = '';
        
        try {
            const dateStr = row.VoucherDate;
            if (dateStr) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    year = date.getFullYear().toString();
                    // Get short or long month name. The existing data likely uses full names or short, let's stick to short e.g. "Jan" or full "January". 
                    // Looking at previous likely data, it might be safer to use consistent formatting. 
                    // Let's use full month name to be safe or matches standard. 
                    // Start with what Date gives us.
                    month = date.toLocaleString('en-US', { month: 'short' }); 
                }
            }
        } catch (e) {
            console.error('Error parsing date', row.VoucherDate);
        }

        return {
            year: year,
            month: month,
            accountName: (row.AccountName || '').trim(),
            accountBeat: (row.Beat || '').trim(),
            baseCat: (row.BaseCat || '').trim(),
            consignee: (row.Parentname || '').trim(), // Using Parentname as Consignee
            employee: (row.SalesMan_Cloud || '').trim(),
            totalAmt: parseFloat((row.Amount || '0').replace(/[^0-9.-]+/g, '')) || 0,
        };
    });
}
