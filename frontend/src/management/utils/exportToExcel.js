import * as XLSX from "xlsx";

/**
 * Export records to a real Excel .xlsx workbook.
 * Preferred columns appear first; additional backend fields
 * are appended automatically.
 */
export function exportToExcel({
    records,
    fileName,
    sheetName,
    preferredColumns = []
}) {
    if (!Array.isArray(records) || records.length === 0) {
        window.alert("There is no data available to export.");
        return;
    }

    const additionalColumns = [...new Set(
        records.flatMap((record) =>
            record && typeof record === "object"
                ? Object.keys(record)
                : []
        )
    )].filter((key) => !preferredColumns.includes(key));

    const columns = [
        ...preferredColumns,
        ...additionalColumns
    ];

    const rows = records.map((record) => {
        const row = {};

        columns.forEach((key) => {
            const value = record?.[key];

            if (value === null || value === undefined) {
                row[key] = "";
            } else if (typeof value === "object") {
                row[key] = JSON.stringify(value);
            } else {
                // Prevent formula-like text from executing in Excel.
                const textValue = String(value);

                row[key] = /^[=+@\-\t\r]/.test(textValue)
                    ? `'${textValue}`
                    : value;
            }
        });

        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: columns
    });

    const headerOverrides = {
        id: "Product ID",
        productFamily: "Product Family",
        userId: "Customer ID",
        orderId: "Order ID",
        returnId: "Return ID",
        requestId: "Request ID",
        itemTotal: "Item Total",
        createdAt: "Created At",
        updatedAt: "Updated At",
        requestedAt: "Requested At",
        approvedAt: "Approved At",
        rejectedAt: "Rejected At",
        completedAt: "Completed At",
        processedAt: "Processed At",
        paymentMethod: "Payment Method",
        paymentStatus: "Payment Status",
        imageUrl: "Image URL",
        productId: "Product ID",
        productImage: "Product Image",
        orderTotal: "Order Total",
        adminRemarks: "Admin Remarks",
        otherReturnReason: "Other Return Reason",
        trackingNumber: "Tracking Number"
    };

    columns.forEach((column, index) => {
        const cellAddress = XLSX.utils.encode_cell({
            r: 0,
            c: index
        });

        if (worksheet[cellAddress]) {
            worksheet[cellAddress].v =
                headerOverrides[column] ||
                column
                    .replace(
                        /([a-z0-9])([A-Z])/g,
                        "$1 $2"
                    )
                    .replace(
                        /^./,
                        (character) => character.toUpperCase()
                    );
        }
    });

    worksheet["!cols"] = columns.map((column) => ({
        wch: Math.min(
            Math.max(column.length + 2, 14),
            36
        )
    }));

    worksheet["!autofilter"] = {
        ref: XLSX.utils.encode_range({
            s: { r: 0, c: 0 },
            e: {
                r: rows.length,
                c: Math.max(columns.length - 1, 0)
            }
        })
    };

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        (sheetName || "Data").slice(0, 31)
    );

    XLSX.writeFile(
        workbook,
        fileName.endsWith(".xlsx")
            ? fileName
            : `${fileName}.xlsx`
    );
}