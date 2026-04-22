import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography, Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert, Skeleton } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}> = ({ title, value, icon, color, loading }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box sx={{ backgroundColor: color + "20", borderRadius: 2, p: 1, mr: 2, display: "flex" }}>{icon}</Box>
        <Typography variant="h6" color="textSecondary">{title}</Typography>
      </Box>
      {loading ? <Skeleton variant="text" width={100} height={60} /> : <Typography variant="h3" sx={{ fontWeight: 700 }}>{value}</Typography>}
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProducts: 0, lowStockProducts: 0, outOfStockProducts: 0, totalSuppliers: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_URL || "/api";
        const [productsRes, lowStockRes, outOfStockRes, suppliersRes, transactionsRes] = await Promise.all([
          fetch(baseUrl + "/products/").then(r => r.json()),
          fetch(baseUrl + "/products/low_stock/").then(r => r.json()),
          fetch(baseUrl + "/products/out_of_stock/").then(r => r.json()),
          fetch(baseUrl + "/suppliers/").then(r => r.json()),
          fetch(baseUrl + "/transactions/").then(r => r.json()),
        ]);
        setStats({
          totalProducts: productsRes.count || productsRes.length || 0,
          lowStockProducts: lowStockRes.length || 0,
          outOfStockProducts: outOfStockRes.length || 0,
          totalSuppliers: suppliersRes.count || suppliersRes.length || 0,
        });
        setRecentTransactions(transactionsRes.results || transactionsRes || []);
      } catch (err) {
        setError("Unable to connect to API server.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, mt: 10 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>Overview of your inventory system</Typography>
      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Products" value={stats.totalProducts} icon={<InventoryIcon sx={{ color: "#1976d2" }} />} color="#1976d2" loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Low Stock" value={stats.lowStockProducts} icon={<WarningIcon sx={{ color: "#f57c00" }} />} color="#f57c00" loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Out of Stock" value={stats.outOfStockProducts} icon={<ShoppingCartIcon sx={{ color: "#d32f2f" }} />} color="#d32f2f" loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Suppliers" value={stats.totalSuppliers} icon={<PeopleIcon sx={{ color: "#388e3c" }} />} color="#388e3c" loading={loading} />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => (<TableCell key={j}><Skeleton /></TableCell>))}</TableRow>
                  )) : recentTransactions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center">No transactions yet</TableCell></TableRow>
                  ) : recentTransactions.slice(0, 5).map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.transaction_id || t.id}</TableCell>
                      <TableCell><Chip label={t.transaction_type_display || t.transaction_type}
                        color={t.transaction_type === "IN" ? "success" : t.transaction_type === "OUT" ? "error" : t.transaction_type === "RET" ? "warning" : "default"} size="small" /></TableCell>
                      <TableCell>{t.product_name || "Product #" + t.product}</TableCell>
                      <TableCell>{t.quantity}</TableCell>
                      <TableCell>{t.created_at ? new Date(t.created_at).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Box><Typography variant="body2" color="textSecondary">Access the system:</Typography>
              <Box sx={{ mt: 2 }}><Typography variant="subtitle2">Admin Panel</Typography><Typography variant="body2" color="primary">/admin/</Typography></Box>
              <Box sx={{ mt: 2 }}><Typography variant="subtitle2">API Root</Typography><Typography variant="body2" color="primary">/api/</Typography></Box>
              <Box sx={{ mt: 2 }}><Typography variant="subtitle2">Admin Login</Typography><Typography variant="body2">admin / admin123</Typography></Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Dashboard;
