
import { NextResponse } from 'next/server';
import Papa from 'papaparse';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_LINK?.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];

export async function GET(request: Request) {
    if (!SPREADSHEET_ID) {
        return NextResponse.json({ error: 'Google Sheet ID invalid or missing in configuration' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const sheetName = searchParams.get('sheet');

    if (!sheetName) {
        return NextResponse.json({ error: 'Sheet name required' }, { status: 400 });
    }

    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // If the sheet is completely private/not shared properly, this might fail with 403 or redirect to login
            throw new Error(`Failed to fetch sheet: ${response.statusText}`);
        }
        const csvText = await response.text();

        const { data } = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
        });

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=59',
            },
        });
    } catch (error) {
        console.error('Error fetching sheet:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
