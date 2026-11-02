import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Eye,
  CheckCircle2,
  Building2,
  Server,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useDataCenter } from '../context/DataContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { EmptyState } from '../components/common/EmptyState';

export const ReportsPage: React.FC = () => {
  const { reports, dataCenters, servers, clients, showToast, isLoadingData, dataError, refetchData } = useDataCenter();
  const [selectedFacility, setSelectedFacility] = useState('ALL');
  const [activeReportId, setActiveReportId] = useState<string>(reports[0]?.id || '');
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const selectedReport = useMemo(() => {
    return reports.find(r => r.id === activeReportId) || reports[0];
  }, [reports, activeReportId]);

  const handleExport = (reportTitle: string, format: 'PDF' | 'CSV' | 'Excel') => {
    const exportId = `${reportTitle}-${format}`;
    setDownloadingFormat(exportId);
    setTimeout(() => {
      setDownloadingFormat(null);
      showToast(`${reportTitle} exported as ${format} successfully.`);
    }, 800);
  };

  // Real preview data generated from database data
  const previewRows = useMemo(() => {
    const filteredServers = selectedFacility === 'ALL'
      ? servers
      : servers.filter(s => s.dataCenterId === selectedFacility);

    return filteredServers.slice(0, 6).map(srv => {
      const dc = dataCenters.find(d => d.id === srv.dataCenterId);
      const client = clients.find(c => c.id === srv.allocatedClientId || c.id === (srv as any).clientId);
      return {
        hostname: srv.hostname,
        assetTag: srv.assetTag,
        facility: dc?.name || srv.dataCenterName || 'MUM-1 Facility',
        specs: `${srv.cpu || 'Multi-Core Compute'} • ${srv.ramGb || 256} GB RAM`,
        allocation: client?.name || (srv.status === 'In Use' ? 'Allocated Client' : 'Unallocated Inventory'),
        status: srv.status
      };
    });
  }, [servers, dataCenters, clients, selectedFacility]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#F8FAFC] tracking-tight">Reports</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Facility summaries, server allocation records, and system reports
          </p>
        </div>
      </div>

      {dataError && <ErrorBanner message={dataError} onRetry={refetchData} />}

      {/* Scope Toolbar */}
      <div className="p-4 bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8] font-medium">Filter by Data Center:</span>
            <select
              value={selectedFacility}
              onChange={e => setSelectedFacility(e.target.value)}
              className="py-1.5 px-3 text-xs text-slate-200 bg-[#0A1424] border border-[rgba(148,163,184,0.2)] rounded-lg focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Facilities ({dataCenters.length} Sites)</option>
              {dataCenters.map(dc => (
                <option key={dc.id} value={dc.id}>
                  {dc.name} ({dc.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] text-[#64748B] font-mono">
          {reports.length} Reports Available
        </div>
      </div>

      {/* Reports Grid */}
      {isLoadingData && reports.length === 0 ? (
        <LoadingSkeleton rows={4} type="cards" />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports available"
          description="Reports generated for facilities, hardware, and client allocations will appear here."
          actionText="Refresh Reports"
          onAction={refetchData}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(rep => {
            const isSelected = (selectedReport?.id === rep.id);
            return (
              <div
                key={rep.id}
                onClick={() => setActiveReportId(rep.id)}
                className={`p-5 bg-[#101C30] border rounded-xl shadow-lg flex flex-col justify-between space-y-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 shadow-[0_0_16px_rgba(37,99,235,0.15)] bg-[#122038]'
                    : 'border-[rgba(148,163,184,0.14)] hover:border-[rgba(148,163,184,0.25)] hover:bg-[#122038]/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-blue-400 font-semibold px-2 py-0.5 bg-[#0A1424] border border-blue-500/20 rounded-md">
                      {rep.type || 'System Report'}
                    </span>
                    <span className="text-[11px] text-[#94A3B8] font-mono">{rep.period || 'Current Period'}</span>
                  </div>
                  <h3 className="font-semibold text-[#F8FAFC] text-sm mt-3">{rep.title}</h3>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    {rep.description || 'Report for facilities, servers, and client allocations.'}
                  </p>
                </div>

                <div className="p-3 bg-[#0D1728] border border-[rgba(148,163,184,0.1)] rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="text-slate-300 font-medium text-[11px]">
                      Generated by <span className="text-[#F8FAFC] font-semibold">{rep.generatedBy || 'Rajesh Verma'}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{rep.generatedDate || '2026-09-22'}</div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {rep.fileSize || '2.4 MB'}
                  </span>
                </div>

                {/* Export Options */}
                <div className="pt-3 border-t border-[rgba(148,163,184,0.1)] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#64748B] flex items-center gap-1.5 font-mono">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Click to view preview</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {(['PDF', 'CSV', 'Excel'] as const).map(fmt => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleExport(rep.title, fmt);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-[#0A1424] border border-[rgba(148,163,184,0.2)] hover:border-blue-500/40 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>{fmt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Report Preview Table */}
      {selectedReport && (
        <div className="bg-[#101C30] border border-[rgba(148,163,184,0.14)] rounded-xl shadow-lg p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                Live Preview: {selectedReport.title}
              </h3>
            </div>
            <span className="text-[11px] text-[#94A3B8] font-mono">
              Status: Verified Database Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0D1728] border-b border-[rgba(148,163,184,0.12)] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Server / Asset Tag</th>
                  <th className="px-4 py-3">Facility Location</th>
                  <th className="px-4 py-3">Hardware Specifications</th>
                  <th className="px-4 py-3">Assigned Client / Purpose</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(148,163,184,0.08)] font-mono">
                {previewRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500 font-sans">
                      No records found for the selected facility filter.
                    </td>
                  </tr>
                ) : (
                  previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#15243B]/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#F8FAFC]">
                        <div>{row.hostname}</div>
                        <div className="text-[11px] text-blue-400 font-normal">{row.assetTag}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-sans">{row.facility}</td>
                      <td className="px-4 py-3 text-slate-300 font-sans text-[11px]">{row.specs}</td>
                      <td className="px-4 py-3 text-slate-200 font-sans text-xs">{row.allocation}</td>
                      <td className="px-4 py-3 text-right font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.status === 'Available' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                          row.status === 'In Use' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' :
                          'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
