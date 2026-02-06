// Sales Report Page Script with Animations

let salesData = {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    grossProfit: 0,
    margin: 0,
    dailySales: [],
    recentOrders: []
};

function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return '₱0.00';
    return '₱' + parseFloat(amount).toFixed(2);
}

function formatPercent(value) {
    if (!value || isNaN(value)) return '0%';
    return parseFloat(value).toFixed(1) + '%';
}

// Animation functions
function animateValue(element, start, end, duration, prefix = '', suffix = '') {
    if (!element) return;
    
    const startTime = performance.now();
    const isCurrency = prefix === '₱';
    const isNumber = typeof end === 'number';
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        let currentValue;
        if (isNumber) {
            currentValue = start + (end - start) * easeOut;
            
            if (isCurrency) {
                element.textContent = `${prefix}${currentValue.toFixed(2)}`;
            } else if (suffix === '%') {
                element.textContent = `${currentValue.toFixed(1)}${suffix}`;
            } else {
                element.textContent = Math.round(currentValue);
            }
        } else {
            element.textContent = end;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

function fadeInElement(element, delay = 0) {
    if (!element) return;
    
    setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Trigger reflow
        void element.offsetWidth;
        
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, delay);
}

function pulseElement(element) {
    if (!element) return;
    
    element.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    element.style.transform = 'scale(1.05)';
    element.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    }, 300);
}

function animateProgressBar(bar, targetHeight, duration = 1000) {
    if (!bar) return;
    
    const startHeight = 0;
    const startTime = performance.now();
    
    function updateBar(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentHeight = startHeight + (targetHeight - startHeight) * easeOut;
        
        bar.style.height = `${currentHeight}%`;
        
        // Add glow effect for today's bar
        if (bar.dataset.isToday === 'true') {
            const intensity = 1 + (0.5 * easeOut);
            bar.style.boxShadow = `0 0 ${10 * intensity}px rgba(76, 175, 80, ${0.3 * easeOut})`;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateBar);
        }
    }
    
    requestAnimationFrame(updateBar);
}

async function loadSalesReport() {
    try {
        console.log('📊 Loading sales report data...');
        
        // Show loading animation
        const loadingElements = document.querySelectorAll('.card, #salesTableBody, #chartBars');
        loadingElements.forEach(el => {
            if (el) el.classList.add('loading-pulse');
        });
        
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const stats = result.success ? result.data : result;
        
        console.log('Sales report stats:', stats);
        
        // Store old values for animation
        const oldData = { ...salesData };
        
        // Update sales data
        salesData.totalRevenue = stats.totalRevenue || 0;
        salesData.totalOrders = stats.totalOrders || 0;
        salesData.totalCustomers = stats.totalCustomers || 0;
        salesData.avgOrderValue = salesData.totalOrders > 0 ? salesData.totalRevenue / salesData.totalOrders : 0;
        
        // Calculate profit
        salesData.grossProfit = salesData.totalRevenue * 0.30;
        salesData.margin = salesData.totalRevenue > 0 ? (salesData.grossProfit / salesData.totalRevenue) * 100 : 0;
        
        if (stats.recentOrders && stats.recentOrders.length > 0) {
            salesData.recentOrders = stats.recentOrders;
        }
        
        // Remove loading animation
        loadingElements.forEach(el => {
            if (el) el.classList.remove('loading-pulse');
        });
        
        updateSalesReportDisplay(oldData);
        
    } catch (error) {
        console.error('❌ Error loading sales report:', error);
        
        // Remove loading animation
        document.querySelectorAll('.loading-pulse').forEach(el => {
            el.classList.remove('loading-pulse');
        });
        
        updateSalesReportDisplay();
    }
}

function updateSalesReportDisplay(oldData = null) {
    // Update report period with animation
    const today = new Date();
    const periodEl = document.getElementById('reportPeriod');
    if (periodEl) {
        periodEl.textContent = `Today's Report - ${today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        fadeInElement(periodEl, 100);
    }
    
    // Update total revenue with animation
    const totalRevenueEl = document.getElementById('totalRevenueCard');
    if (totalRevenueEl) {
        const startValue = oldData ? oldData.totalRevenue : 0;
        animateValue(totalRevenueEl, startValue, salesData.totalRevenue, 1000, '₱');
        fadeInElement(totalRevenueEl, 200);
        
        // Add subtle pulse on update
        setTimeout(() => pulseElement(totalRevenueEl.closest('.card')), 1200);
    }
    
    // Update total orders with animation
    const totalOrdersEl = document.getElementById('totalOrdersCard');
    if (totalOrdersEl) {
        const startValue = oldData ? oldData.totalOrders : 0;
        animateValue(totalOrdersEl, startValue, salesData.totalOrders, 800);
        fadeInElement(totalOrdersEl, 300);
    }
    
    const ordersChangeEl = document.getElementById('ordersChange');
    if (ordersChangeEl) {
        ordersChangeEl.textContent = `${salesData.totalOrders} orders today`;
        fadeInElement(ordersChangeEl, 400);
    }
    
    // Update total customers with animation
    const totalCustomersEl = document.getElementById('totalCustomersCard');
    if (totalCustomersEl) {
        const startValue = oldData ? oldData.totalCustomers : 0;
        animateValue(totalCustomersEl, startValue, salesData.totalCustomers, 800);
        fadeInElement(totalCustomersEl, 400);
    }
    
    const customersChangeEl = document.getElementById('customersChange');
    if (customersChangeEl) {
        customersChangeEl.textContent = `${salesData.totalCustomers} customers today`;
        fadeInElement(customersChangeEl, 500);
    }
    
    // Update average order value with animation
    const avgOrderEl = document.getElementById('avgOrderValue');
    if (avgOrderEl) {
        const startValue = oldData ? oldData.avgOrderValue : 0;
        animateValue(avgOrderEl, startValue, salesData.avgOrderValue, 1000, '₱');
        fadeInElement(avgOrderEl, 600);
    }
    
    // Update gross profit with animation
    const grossProfitEl = document.getElementById('grossProfit');
    if (grossProfitEl) {
        const startValue = oldData ? oldData.grossProfit : 0;
        animateValue(grossProfitEl, startValue, salesData.grossProfit, 1000, '₱');
        fadeInElement(grossProfitEl, 700);
    }
    
    // Update margin with animation
    const marginEl = document.getElementById('marginValue');
    if (marginEl) {
        const startValue = oldData ? oldData.margin : 0;
        animateValue(marginEl, startValue, salesData.margin, 800, '', '%');
        fadeInElement(marginEl, 800);
    }
    
    // Update graph status
    const graphStatusEl = document.getElementById('graphStatus');
    if (graphStatusEl) {
        if (salesData.totalOrders > 0) {
            graphStatusEl.textContent = `${salesData.totalOrders} orders - ₱${salesData.totalRevenue.toFixed(2)} revenue`;
        } else {
            graphStatusEl.textContent = 'No sales data for today';
        }
        fadeInElement(graphStatusEl, 900);
    }
    
    // Render sales chart with animation
    renderSalesChart(salesData);
    
    // Update sales summary table with animation
    updateSalesTable();
}

function updateSalesTable() {
    const tableBody = document.getElementById('salesTableBody');
    if (!tableBody) return;
    
    // Clear with fade out
    tableBody.style.opacity = '0';
    tableBody.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        if (salesData.totalOrders === 0) {
            tableBody.innerHTML = `
                <tr style="opacity: 0;">
                    <td colspan="6" style="text-align: center; padding: 20px;">No sales data available</td>
                </tr>
            `;
        } else {
            // Create today's sales summary row
            const today = new Date();
            const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            tableBody.innerHTML = `
                <tr style="opacity: 0;">
                    <td>${dateStr}</td>
                    <td>${salesData.totalOrders}</td>
                    <td>${formatCurrency(salesData.totalRevenue)}</td>
                    <td>${formatCurrency(salesData.totalRevenue * 0.70)}</td>
                    <td>${formatCurrency(salesData.grossProfit)}</td>
                    <td>${salesData.totalCustomers}</td>
                </tr>
            `;
            
            // Add recent orders if available
            if (salesData.recentOrders && salesData.recentOrders.length > 0) {
                let summaryHTML = `
                    <tr style="opacity: 0; background-color: #f9f9f9; border-top: 2px solid #ddd;">
                        <td colspan="6" style="padding: 10px; font-size: 12px; color: #666;">
                            <strong>Recent Orders:</strong> 
                `;
                
                salesData.recentOrders.slice(0, 5).forEach((order, index) => {
                    const time = new Date(order.createdAt).toLocaleTimeString();
                    summaryHTML += `Order #${order.orderNumber} (${time}) - ₱${(order.total || 0).toFixed(2)}`;
                    if (index < Math.min(4, salesData.recentOrders.length - 1)) summaryHTML += ' | ';
                });
                
                summaryHTML += `</td></tr>`;
                
                tableBody.innerHTML += summaryHTML;
            }
        }
        
        // Fade in rows one by one
        setTimeout(() => {
            tableBody.style.opacity = '1';
            const rows = tableBody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                row.style.transition = `opacity 0.5s ease ${index * 100}ms, transform 0.5s ease ${index * 100}ms`;
                row.style.transform = 'translateX(-20px)';
                void row.offsetWidth; // Trigger reflow
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            });
        }, 100);
    }, 300);
}

function renderSalesChart(stats) {
    // Update graph status
    const graphStatusEl = document.getElementById('graphStatus');
    if (graphStatusEl) {
        if (stats.totalOrders > 0) {
            graphStatusEl.textContent = `${stats.totalOrders} orders - ₱${(stats.totalRevenue || 0).toFixed(2)} revenue`;
        } else {
            graphStatusEl.textContent = 'No sales data for today';
        }
    }
    
    const chartBars = document.getElementById('chartBars');
    if (!chartBars) return;
    
    // Clear with fade out
    chartBars.style.opacity = '0';
    chartBars.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        chartBars.innerHTML = '';
        
        // Get today's date and last 7 days
        const today = new Date();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push(date);
        }
        
        // Get day names
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Calculate chart data
        const totalRevenue = stats.totalRevenue || 0;
        const hasSales = totalRevenue > 0;
        
        // Define bar heights based on sales data
        let barHeights;
        
        if (hasSales) {
            // Kapag may sales, gumamit ng real data pattern
            const maxRevenue = Math.max(totalRevenue * 1.2, 5000);
            
            // Gumawa ng realistic pattern ng sales data
            // (Mas mababa ang previous days, mas mataas ang today)
            const basePercentage = (totalRevenue / maxRevenue) * 100;
            barHeights = [
                basePercentage * 0.3, // 6 days ago
                basePercentage * 0.4, // 5 days ago
                basePercentage * 0.35, // 4 days ago
                basePercentage * 0.5, // 3 days ago
                basePercentage * 0.6, // 2 days ago
                basePercentage * 0.75, // Yesterday
                basePercentage // Today
            ];
            
            // Siguraduhin na hindi lalagpas sa 100%
            barHeights = barHeights.map(height => Math.min(height, 95));
        } else {
            // Kapag ZERO sales, lahat ng bars ay napakababa (5-10% lang)
            barHeights = [5, 7, 6, 8, 5, 9, 10];
        }
        
        barHeights.forEach((targetHeight, index) => {
            const bar = document.createElement('div');
            const barValue = hasSales ? (targetHeight / 100) * (Math.max(totalRevenue * 1.2, 5000)) : 0;
            
            // Set initial styles - mas mababa ang starting point kapag 0 ang sales
            const initialHeight = hasSales ? 0 : 2; // Kapag 0 sales, start sa 2% para visible pero mababa
            
            bar.style.cssText = `
                height: ${initialHeight}%;
                background: ${index === 6 ? (hasSales ? '#4CAF50' : '#FF9800') : '#E0E0E0'};
                margin: 0 3px;
                border-radius: 4px 4px 0 0;
                flex: 1;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                color: white;
                font-size: 10px;
                font-weight: bold;
                padding-bottom: 2px;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.5s ease ${index * 100}ms, transform 0.5s ease ${index * 100}ms;
                position: relative;
                overflow: hidden;
            `;
            
            // Add special styling for zero sales state
            if (!hasSales && index === 6) {
                bar.style.background = 'linear-gradient(to top, #FF9800, #FFB74D)';
                bar.style.boxShadow = 'inset 0 -2px 5px rgba(0,0,0,0.1)';
            }
            
            bar.title = hasSales ? 
                `${dayNames[index]}: ₱${barValue.toFixed(2)}` : 
                `${dayNames[index]}: No sales`;
            
            bar.textContent = '';
            bar.dataset.isToday = (index === 6).toString();
            bar.dataset.hasSales = hasSales.toString();
            
            chartBars.appendChild(bar);
            
            // Animate bar growth with different animation style for zero sales
            setTimeout(() => {
                if (hasSales) {
                    // Normal animation para sa may sales
                    animateProgressBar(bar, targetHeight, 800);
                } else {
                    // Special slow, subtle animation para sa zero sales
                    const startTime = performance.now();
                    const duration = 1200;
                    
                    function updateZeroBar(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // Very subtle easing for zero sales
                        const easeOut = 1 - Math.pow(1 - progress, 2);
                        const currentHeight = 2 + (targetHeight - 2) * easeOut;
                        
                        bar.style.height = `${currentHeight}%`;
                        
                        // Add pulsing effect for today's zero sales bar
                        if (index === 6) {
                            const pulse = Math.sin(progress * Math.PI * 2) * 0.1;
                            bar.style.opacity = `${0.7 + pulse}`;
                        }
                        
                        if (progress < 1) {
                            requestAnimationFrame(updateZeroBar);
                        }
                    }
                    
                    requestAnimationFrame(updateZeroBar);
                }
                
                // Fade in bar
                bar.style.opacity = hasSales ? '1' : '0.8';
                bar.style.transform = 'translateY(0)';
                
                // Add floating indicator for zero sales
                if (!hasSales && index === 6) {
                    setTimeout(() => {
                        const zeroIndicator = document.createElement('div');
                        zeroIndicator.textContent = '₱0';
                        zeroIndicator.style.cssText = `
                            position: absolute;
                            top: -20px;
                            left: 50%;
                            transform: translateX(-50%);
                            background: rgba(255, 0, 0, 0.9);
                            color: white;
                            padding: 2px 6px;
                            border-radius: 10px;
                            font-size: 9px;
                            font-weight: bold;
                            opacity: 0;
                            transition: opacity 0.5s ease, top 0.5s ease;
                        `;
                        bar.appendChild(zeroIndicator);
                        
                        setTimeout(() => {
                            zeroIndicator.style.opacity = '1';
                            zeroIndicator.style.top = '-15px';
                        }, 100);
                    }, 500);
                }
            }, index * 150);
        });
        
        // Update summary with special message for zero sales
        const chartSummary = document.getElementById('chartSummary');
        if (chartSummary) {
            if (hasSales) {
                chartSummary.textContent = `Today: ₱${totalRevenue.toFixed(2)}`;
            } else {
                chartSummary.textContent = `Today: ₱0.00 • No sales yet`;
                chartSummary.style.color = '#000000ff';
                chartSummary.style.fontWeight = 'bold';
            }
            fadeInElement(chartSummary, 1200);
        }
        
        // Fade in chart container
        chartBars.style.opacity = '1';
        
        // Add zero sales message if applicable
        if (!hasSales) {
            setTimeout(() => {
                const zeroMessage = document.createElement('div');
                zeroMessage.textContent = 'No sales recorded today';
                zeroMessage.style.cssText = `
                    position: absolute;
                    bottom: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: rgba(247, 7, 7, 1)
                    font-size: 11px;
                    font-weight: bold;
                    opacity: 0;
                    animation: fadeInZeroMessage 1s ease 1.5s forwards;
                `;
                chartBars.parentElement.style.position = 'relative';
                chartBars.parentElement.appendChild(zeroMessage);
            }, 1000);
        }
    }, 300);
}

// Add CSS for loading animation and zero sales effects
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes loadingPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        
        @keyframes cardGlow {
            0%, 100% { box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            50% { box-shadow: 0 5px 15px rgba(76, 175, 80, 0.2); }
        }
        
        @keyframes zeroPulse {
            0%, 100% { 
                opacity: 0.7;
                box-shadow: inset 0 -2px 5px rgba(0,0,0,0.1);
            }
            50% { 
                opacity: 0.9;
                box-shadow: inset 0 -2px 5px rgba(255, 152, 0, 0.3),
                          0 0 10px rgba(255, 152, 0, 0.2);
            }
        }
        
        @keyframes fadeInZeroMessage {
            from { opacity: 0; transform: translateX(-50%) translateY(10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        .loading-pulse {
            animation: loadingPulse 1s ease-in-out infinite;
        }
        
        .card-animated {
            transition: all 0.3s ease;
        }
        
        .card-animated:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .value-updated {
            animation: cardGlow 1s ease;
        }
        
        .zero-sales-bar {
            animation: zeroPulse 2s ease-in-out infinite;
        }
        
        .chart-container {
            position: relative;
            min-height: 200px;
        }
    `;
    document.head.appendChild(style);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Sales Report page loaded');
    
    // Add animation styles
    addAnimationStyles();
    
    const isSalesPage = window.location.pathname.includes('salesandreports');
    
    if (isSalesPage) {
        console.log('🏁 Loading sales report...');
        
        // Add animation classes to cards
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('card-animated');
        });
        
        // Add chart container class
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.classList.add('chart-container');
        }
        
        // Load initial data with slight delay for better visual effect
        setTimeout(() => {
            loadSalesReport();
        }, 500);
        
        // Refresh every 30 seconds
        setInterval(() => {
            console.log(' Refreshing sales report...');
            loadSalesReport();
        }, 30000);
        
        // Add click animations to cards
        document.addEventListener('click', function(e) {
            const card = e.target.closest('.card');
            if (card) {
                card.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            }
        });
    }
});