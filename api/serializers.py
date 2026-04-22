from rest_framework import serializers
from inventory.models import Category, Supplier, Product, InventoryItem, Transaction
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_person', 'email', 'phone', 'address', 'website', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    current_stock = serializers.IntegerField(read_only=True)
    stock_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'description', 'category', 'category_name',
            'supplier', 'supplier_name', 'unit_price', 'cost_price',
            'reorder_level', 'current_stock', 'stock_value', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['sku', 'current_stock', 'stock_value', 'created_at', 'updated_at']


class InventoryItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'product', 'product_name', 'product_sku', 'batch_number',
            'quantity', 'location', 'expiry_date', 'received_date',
            'notes', 'is_active', 'created_by', 'created_by_username',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['received_date', 'created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'transaction_type', 'transaction_type_display',
            'product', 'product_name', 'product_sku', 'quantity',
            'unit_price', 'total_amount', 'reference_number', 'notes',
            'created_by', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['transaction_id', 'total_amount', 'created_at']


class StockReportSerializer(serializers.Serializer):
    """Serializer for stock reports"""
    product_id = serializers.IntegerField()
    sku = serializers.CharField()
    name = serializers.CharField()
    category = serializers.CharField()
    current_stock = serializers.IntegerField()
    reorder_level = serializers.IntegerField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    stock_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    status = serializers.CharField()  # 'OK', 'LOW', 'OUT'
    
    class Meta:
        fields = [
            'product_id', 'sku', 'name', 'category', 'current_stock',
            'reorder_level', 'unit_price', 'stock_value', 'status'
        ]