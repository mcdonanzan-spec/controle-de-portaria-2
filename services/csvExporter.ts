import { Visitor, Delivery } from '../types';

const formatDate = (date?: Date) => {
  if (!date) return '';
  return `"${date.toLocaleString('pt-BR')}"`;
};

const escapeCsvField = (field: string | boolean) => {
    if (typeof field === 'boolean') return field ? '"Sim"' : '"Não"';
    return `"${field.replace(/"/g, '""')}"`;
}

export const exportToCsv = (visitors: Visitor[], deliveries: Delivery[]) => {
  let csvContent = [];

  // Visitor data
  csvContent.push("REGISTRO DE VISITANTES");
  const visitorHeaders = [
    "ID", "Nome", "Documento", "Empresa/Origem", "Motivo da Visita", "Pessoa Visitada",
    "Horário de Entrada", "Horário de Saída", "Capacete", "Bota", "Óculos",
    "Veículo", "Cor", "Placa"
  ];
  csvContent.push(visitorHeaders.join(","));
  visitors.forEach(v => {
    const row = [
        v.id,
        escapeCsvField(v.name),
        escapeCsvField(v.document),
        escapeCsvField(v.company),
        escapeCsvField(v.visitReason),
        escapeCsvField(v.personVisited),
        formatDate(v.entryTime),
        formatDate(v.exitTime),
        escapeCsvField(v.epi.helmet),
        escapeCsvField(v.epi.boots),
        escapeCsvField(v.epi.glasses),
        escapeCsvField(v.vehicle.model),
        escapeCsvField(v.vehicle.color),
        escapeCsvField(v.vehicle.plate)
    ].join(",");
    csvContent.push(row);
  });

  csvContent.push("");
  csvContent.push("");

  // Delivery data
  csvContent.push("REGISTRO DE ENTREGAS");
  csvContent.push("ID,Fornecedor,Motorista,Documento do Motorista,Nº da NF,Placa,Horário de Entrada,Horário de Saída");
  deliveries.forEach(d => {
    const row = [d.id, escapeCsvField(d.supplier), escapeCsvField(d.driverName), escapeCsvField(d.driverDocument), escapeCsvField(d.invoiceNumber), escapeCsvField(d.licensePlate), formatDate(d.entryTime), formatDate(d.exitTime)].join(",");
    csvContent.push(row);
  });

  const csvString = csvContent.join("\r\n");
  const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `relatorio_portaria_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};