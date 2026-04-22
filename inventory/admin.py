from django.contrib import admin
from .models import Category, Supplier, Product, InventoryItem, Transaction, AuditLog


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at',)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'email', 'phone', 'is_active')
    search_fields = ('name', 'contact_person', 'email')
    list_filter = ('is_active', 'created_at')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'category', 'unit_price', 'cost_price', 'current_stock', 'stock_value', 'is_active')
    search_fields = ('sku', 'name', 'description')
    list_filter = ('category', 'supplier', 'is_active', 'created_at')
    readonly_fields = ('current_stock', 'stock_value')
    fieldsets = (
        ('Basic Information', {
            'fields': ('sku', 'name', 'description', 'category', 'supplier')
        }),
        ('Pricing', {
            'fields': ('unit_price', 'cost_price')
        }),
        ('Inventory', {
            'fields': ('reorder_level', 'current_stock', 'stock_value')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('product', 'batch_number', 'quantity', 'location', 'expiry_date', 'received_date', 'is_active')
    search_fields = ('product__name', 'product__sku', 'batch_number')
    list_filter = ('location', 'is_active', 'received_date', 'expiry_date')
    raw_id_fields = ('product', 'created_by')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'transaction_type', 'product', 'quantity', 'unit_price', 'total_amount', 'created_at')
    search_fields = ('transaction_id', 'product__name', 'product__sku', 'reference_number')
    list_filter = ('transaction_type', 'created_at')
    readonly_fields = ('created_at',)
    raw_id_fields = ('product', 'created_by')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'model_name', 'object_id', 'created_at')
    search_fields = ('user__username', 'action', 'model_name', 'object_id')
    list_filter = ('action', 'model_name', 'created_at')
    readonly_fields = ('user', 'action', 'model_name', 'object_id', 'details', 'ip_address', 'created_at')
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False