from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, F, Value
from django.db.models.functions import Coalesce
from django.contrib.auth.models import User

from inventory.models import Category, Supplier, Product, InventoryItem, Transaction
from .serializers import (
    UserSerializer, CategorySerializer, SupplierSerializer,
    ProductSerializer, InventoryItemSerializer, TransactionSerializer,
    StockReportSerializer
)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class SupplierViewSet(viewsets.ModelViewSet):
    """ViewSet for managing suppliers"""
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['name', 'contact_person', 'email', 'phone']
    filterset_fields = ['is_active']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for managing products"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['sku', 'name', 'description']
    filterset_fields = ['category', 'supplier', 'is_active']
    ordering_fields = ['name', 'sku', 'unit_price', 'created_at']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products with low stock (below reorder level)"""
        products = Product.objects.filter(
            is_active=True
        ).annotate(
            _stock=Coalesce(Sum('inventory_items__quantity', filter=Q(inventory_items__is_active=True)), Value(0))
        ).filter(
            _stock__lt=F('reorder_level')
        )
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """Get products that are out of stock"""
        products = Product.objects.filter(
            is_active=True
        ).annotate(
            _stock=Coalesce(Sum('inventory_items__quantity', filter=Q(inventory_items__is_active=True)), Value(0))
        ).filter(
            _stock=0
        )
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stock_report(self, request):
        """Get comprehensive stock report"""
        products = Product.objects.filter(
            is_active=True
        ).prefetch_related('inventory_items').order_by('category__name', 'name')
        
        report_data = []
        for product in products:
            stock = product.current_stock
            if stock == 0:
                status = 'OUT'
            elif stock < product.reorder_level:
                status = 'LOW'
            else:
                status = 'OK'
            
            report_data.append({
                'product_id': product.id,
                'sku': product.sku,
                'name': product.name,
                'category': product.category.name if product.category else 'Uncategorized',
                'current_stock': stock,
                'reorder_level': product.reorder_level,
                'unit_price': str(product.unit_price),
                'stock_value': str(product.stock_value),
                'status': status
            })
        
        serializer = StockReportSerializer(report_data, many=True)
        return Response(serializer.data)


class InventoryItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing inventory items"""
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'location', 'is_active', 'expiry_date']
    ordering_fields = ['received_date', 'expiry_date', 'quantity']
    ordering = ['-received_date']
    
    def perform_create(self, serializer):
        """Set the created_by user when creating inventory items"""
        serializer.save(created_by=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing transactions"""
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'product', 'created_by']
    ordering_fields = ['created_at', 'quantity', 'total_amount']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        """Set the created_by user when creating transactions"""
        serializer.save(created_by=self.request.user)
        
        # Update inventory when transaction is created
        transaction = serializer.instance
        if transaction.transaction_type in ['IN', 'RET']:
            # Add to inventory
            InventoryItem.objects.create(
                product=transaction.product,
                quantity=transaction.quantity,
                notes=f"Transaction: {transaction.transaction_id}",
                created_by=transaction.created_by
            )
        elif transaction.transaction_type in ['OUT', 'ADJ']:
            # Remove from inventory (simplified - in real app would be more complex)
            # For now, we'll create a negative inventory item
            InventoryItem.objects.create(
                product=transaction.product,
                quantity=-transaction.quantity,
                notes=f"Transaction: {transaction.transaction_id}",
                created_by=transaction.created_by
            )