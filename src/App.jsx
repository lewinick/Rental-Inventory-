import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Building2 } from 'lucide-react';

export default function App() {
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [houseNo, setHouseNo] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: tenantsData } = await supabase.from('tenants').select('*');
      const { data: paymentsData } = await supabase.from('payments').select('*');

      setTenants(tenantsData || []);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTenant(e) {
    e.preventDefault();
    if (!houseNo || !tenantName) return;

    try {
      const { error } = await supabase.from('tenants').insert([
        {
          house_no: houseNo,
          tenant_name: tenantName,
          phone_number: phoneNumber
        }
      ]);

      if (error) throw error;

      setHouseNo('');
      setTenantName('');
      setPhoneNumber('');
      fetchData();
      setActiveTab('dashboard');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  function getStatus(t) {
    const p = payments.find(pay => 
      pay.tenant_name && pay.tenant_name.toLowerCase().trim() === (t.tenant_name || '').toLowerCase().trim()
    );
    return p ? { status: 'COMPLETED', amount: Number(p.amount) || 0 } : { status: 'INCOMPLETE', amount: 0 };
  }

  const paidCount = tenants.filter(t => getStatus(t).status === 'COMPLETED').length;
  
  // Calculate total rent collected securely from all loaded payments
  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#0f172a', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={26} color="#38bdf8" />
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Rental Management Portal</h1>
        </div>
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ background: activeTab === 'dashboard' ? '#0284c7' : 'transparent', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Dashboard</button>
          <button onClick={() => setActiveTab('add')} style={{ background: activeTab === 'add' ? '#0284c7' : 'transparent', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>+ Add Tenant</button>
        </nav>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Loading records...</p>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'white', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Total Houses</span>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.25rem 0 0' }}>{tenants.length}</p>
                  </div>
                  <div style={{ background: 'white', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#16a34a' }}>Paid Tenants</span>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.25rem 0 0', color: '#16a34a' }}>{paidCount}</p>
                  </div>
                  <div style={{ background: 'white', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#dc2626' }}>Incomplete</span>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.25rem 0 0', color: '#dc2626' }}>{tenants.length - paidCount}</p>
                  </div>
                  <div style={{ background: 'white', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#0284c7' }}>Rent Collected</span>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.25rem 0 0', color: '#0f172a' }}>KES {totalCollected.toLocaleString()}</p>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h2 style={{ marginTop: 0, fontSize: '1.2rem', marginBottom: '1rem' }}>September Tenant Ledger</h2>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '0.75rem' }}>House No</th>
                        <th style={{ padding: '0.75rem' }}>Tenant Name</th>
                        <th style={{ padding: '0.75rem' }}>Phone Number</th>
                        <th style={{ padding: '0.75rem' }}>Amount Paid (KES)</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((t, idx) => {
                        const info = getStatus(t);
                        const isPaid = info.status === 'COMPLETED';
                        return (
                          <tr key={t.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{t.house_no}</td>
                            <td style={{ padding: '0.75rem', fontWeight: '500', color: '#0f172a' }}>{t.tenant_name}</td>
                            <td style={{ padding: '0.75rem', color: '#64748b' }}>{t.phone_number}</td>
                            <td style={{ padding: '0.75rem', fontWeight: 'bold', color: isPaid ? '#16a34a' : '#64748b' }}>
                              {isPaid ? info.amount.toLocaleString() : '-'}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{ 
                                padding: '0.25rem 0.6rem', 
                                borderRadius: '9999px', 
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                background: isPaid ? '#dcfce7' : '#fee2e2',
                                color: isPaid ? '#15803d' : '#b91c1c'
                              }}>
                                {isPaid ? 'COMPLETED' : 'INCOMPLETE'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'add' && (
              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '500px', margin: '0 auto' }}>
                <h2 style={{ marginTop: 0 }}>Add New Tenant</h2>
                <form onSubmit={handleAddTenant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '500' }}>House Number</label>
                    <input type="text" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} placeholder="e.g. H26" required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '500' }}>Tenant Name</label>
                    <input type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="e.g. Alice Ayegha" required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '500' }}>Phone Number</label>
                    <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. 254700000000" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Tenant</button>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
