import SwiftUI

struct WatchDashboardView: View {
    // Sample Data (In a real app, this would come from Supabase or WatchConnectivity)
    @State private var todaySales: Double = 125400
    @State private var dailyGoal: Double = 200000
    @State private var orderCount: Int = 12
    
    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                // Header Ring
                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.2), lineWidth: 8)
                    Circle()
                        .trim(from: 0, to: CGFloat(min(todaySales / dailyGoal, 1.0)))
                        .stroke(
                            AngularGradient(gradient: Gradient(colors: [Color.orange, Color.red]), center: .center),
                            style: StrokeStyle(lineWidth: 8, lineCap: .round)
                        )
                        .rotationEffect(.degrees(-90))
                    
                    VStack {
                        Text("\(Int((todaySales / dailyGoal) * 100))%")
                            .font(.system(size: 16, weight: .black, design: .rounded))
                        Text("Sales")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(.secondary)
                    }
                }
                .frame(width: 80, height: 80)
                .padding(.top, 4)
                
                Divider()
                    .padding(.vertical, 4)
                
                // Stats Grid
                HStack(spacing: 12) {
                    VStack(alignment: .leading) {
                        Text("REVENUE")
                            .font(.system(size: 8, weight: .black))
                            .foregroundColor(.orange)
                        Text("\(Int(todaySales)) ₸")
                            .font(.system(size: 12, weight: .bold, design: .rounded))
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing) {
                        Text("ORDERS")
                            .font(.system(size: 8, weight: .black))
                            .foregroundColor(.blue)
                        Text("\(orderCount)")
                            .font(.system(size: 12, weight: .bold, design: .rounded))
                    }
                }
                .padding(.horizontal, 4)
                
                // Recent Sales List
                VStack(alignment: .leading, spacing: 4) {
                    Text("RECENT")
                        .font(.system(size: 8, weight: .black))
                        .foregroundColor(.secondary)
                        .padding(.leading, 4)
                    
                    SaleRow(item: "T-Shirt Black", price: "8,500", color: .gray)
                    SaleRow(item: "Hoodie White", price: "15,200", color: .blue)
                    SaleRow(item: "Cap Red", price: "4,500", color: .red)
                }
                .padding(.top, 4)
            }
        }
        .navigationTitle("Dracarys")
    }
}

struct SaleRow: View {
    let item: String
    let price: String
    let color: Color
    
    var body: some View {
        HStack {
            Rectangle()
                .fill(color)
                .frame(width: 2, height: 20)
                .cornerRadius(1)
            
            VStack(alignment: .leading) {
                Text(item)
                    .font(.system(size: 10, weight: .medium))
                    .lineLimit(1)
                Text("\(price) ₸")
                    .font(.system(size: 9))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding(6)
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(8)
    }
}

#Preview {
    WatchDashboardView()
}
