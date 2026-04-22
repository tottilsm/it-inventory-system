import React from "react";
import { Grid, Box, Typography, Paper } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import WarningIcon from "@mui/icons-material/Warning";
import InventoryIcon from "@mui/icons-material/Inventory";

const Reports: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, mt: 10 }}>
      <Typography variant="h4" gutterBottom>Reports</Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>Generate inventory reports</Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 3, cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
            onClick={() => window.open("/api/products/stock_report/", "_blank")}>
            <InventoryIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
            <Typography variant="h6">Stock Report</Typography>
            <Typography variant="body2" color="textSecondary">View complete stock report</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 3, cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
            onClick={() => window.open("/api/products/low_stock/", "_blank")}>
            <WarningIcon sx={{ fontSize: 40, color: "warning.main", mb: 1 }} />
            <Typography variant="h6">Low Stock Alert</Typography>
            <Typography variant="body2" color="textSecondary">Products needing reorder</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 3, cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
            onClick={() => window.open("/api/products/out_of_stock/", "_blank")}>
            <AssessmentIcon sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
            <Typography variant="h6">Out of Stock</Typography>
            <Typography variant="body2" color="textSecondary">Products currently out of stock</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Reports;
