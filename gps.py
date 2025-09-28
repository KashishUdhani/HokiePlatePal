import folium
from folium import plugins
import webbrowser
import os
import datetime
from math import radians, cos, sin, asin, sqrt

# Virginia Tech campus center coordinates (default starting point)
VT_CENTER_LAT = 37.2284
VT_CENTER_LON = -80.4234

# Dictionary of VT dining halls ONLY
VT_DINING_HALLS = {
    "Dietrick Hall (D2)": {
        "lat": 37.224750005269854, 
        "lon": -80.42090944212596,
        "description": "All-you-care-to-eat dining hall at Dietrick",
        "hours": "Mon-Fri: 7AM-9PM, Sat-Sun: 9AM-8PM",
        "type": "Dining Hall",
        "icon": "cutlery",
        "color": "orange"
    },
    "Perry Place": {
        "lat": 37.229636537709645, 
        "lon": -80.42611056271015,
        "description": "All-you-care-to-eat dining hall at Perry Street",
        "hours": "Mon-Fri: 7AM-9PM, Sat-Sun: 9AM-8PM",
        "type": "Dining Hall",
        "icon": "cutlery",
        "color": "orange"
    },
    "Turner Place": {
        "lat": 37.23113957256836,
        "lon": -80.42267514582704,
        "description": "All-you-care-to-eat dining at Turner Hall",
        "hours": "Mon-Fri: 7AM-10PM, Sat-Sun: 10AM-10PM",
        "type": "Dining Hall",
        "icon": "cutlery",
        "color": "orange"
    },
    "West End Market": {
        "lat": 37.22351950716079, 
        "lon": -80.42187920803231,
        "description": "All-you-care-to-eat dining hall at West End",
        "hours": "Mon-Fri: 7AM-11PM, Sat-Sun: 9AM-11PM",
        "type": "Dining Hall",
        "icon": "cutlery",
        "color": "orange"
    }
}

def create_dining_map():
    """
    Create an interactive map showing all VT dining halls with navigation links.
    """
    # Create the map centered on VT campus
    vt_map = folium.Map(
        location=[VT_CENTER_LAT, VT_CENTER_LON],
        zoom_start=15,  # Campus-wide view
        tiles='OpenStreetMap',
        control_scale=True
    )
    
    # Add custom JavaScript for distance calculation and navigation
    dining_halls_json = str([{"lat": info["lat"], "lon": info["lon"]} for _, info in VT_DINING_HALLS.items()])
    
    distance_script = f"""
    <script>
    var userLocation = null;
    var diningHalls = {dining_halls_json};
    
    function calculateDistance(lat1, lon1, lat2, lon2) {{
        var R = 6371e3; // Earth radius in meters
        var phi1 = lat1 * Math.PI / 180;
        var phi2 = lat2 * Math.PI / 180;
        var deltaPhi = (lat2 - lat1) * Math.PI / 180;
        var deltaLambda = (lon2 - lon1) * Math.PI / 180;
        
        var a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }}
    
    window.addEventListener('load', function() {{
        setTimeout(function() {{
            var mapId = document.querySelector('.folium-map').id;
            var map = window[mapId];
            
            // Try to get user location for distance calculation
            map.on('locationfound', function(e) {{
                userLocation = e.latlng;
            }});

            // When a popup opens, update with distance info if available
            map.on('popupopen', function(e) {{
                var popupContent = e.popup.getContent();
                if (typeof popupContent !== 'string') {{
                    popupContent = popupContent.outerHTML || popupContent.toString();
                }}
                
                var match = popupContent.match(/dining-hall-(\\d+)/);
                if (match) {{
                    var index = parseInt(match[1]);
                    var hall = diningHalls[index];
                    if (hall && userLocation) {{
                        var distance = calculateDistance(
                            userLocation.lat, userLocation.lng,
                            hall.lat, hall.lon
                        );
                        var walkTime = Math.max(1, Math.round(distance / 80));
                        
                        var distanceInfo = `
                        <div style="background: #fef9f0; padding: 8px; border-radius: 5px; margin-top: 8px; border: 1px solid #861F41;">
                            <b>📍 Distance from you:</b> ${{Math.round(distance)}} meters<br>
                            <b>🚶 Walking time:</b> ~${{walkTime}} minutes
                        </div>`;
                        
                        var newContent = popupContent.replace(
                            /<div id="distance-\\d+">[\\s\\S]*?<\\/div>/,
                            '<div id="distance-' + index + '">' + distanceInfo + '</div>'
                        );
                        e.popup.setContent(newContent);
                    }}
                }}
            }});
        }}, 100);
    }});
    </script>
    """

    
    # Add the JavaScript to the map
    vt_map.get_root().html.add_child(folium.Element(distance_script))
    
    # Add all dining halls to the map
    for idx, (name, info) in enumerate(VT_DINING_HALLS.items()):
        # Create navigation buttons
        nav_buttons = f"""
        <div style="margin-top: 10px; text-align: center;">
            <div style="margin-bottom: 8px; font-weight: bold; color: #861F41;">🧭 Get Directions:</div>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                <a href="https://www.google.com/maps/dir/?api=1&destination={info['lat']},{info['lon']}&travelmode=walking" target="_blank" 
                   style="background: #4285f4; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; display: inline-block;">
                    📍 Google Maps
                </a>
                <a href="http://maps.apple.com/?daddr={info['lat']},{info['lon']}&dirflg=w&t=m" target="_blank" 
                   style="background: #007aff; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; display: inline-block;">
                    🍎 Apple Maps
                </a>
                <a href="https://www.waze.com/ul?ll={info['lat']}%2C{info['lon']}&navigate=yes&zoom=17" target="_blank" 
                   style="background: #33ccff; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; display: inline-block;">
                    🚗 Waze
                </a>
            </div>
        </div>
        """
        
        # Create popup with navigation links
        popup_html = f"""
        <div class="dining-hall-{idx}" style="font-family: Arial; width: 320px;">
            <h3 style="color: #861F41; margin: 5px 0;">🍴 {name}</h3>
            <hr style="margin: 5px 0; border-color: #861F41;">
            <p style="margin: 5px 0;"><b>Description:</b> {info['description']}</p>
            <p style="margin: 5px 0;"><b>Hours:</b> {info['hours']}</p>
            <div id="distance-{idx}" style="color: #666; margin-top: 8px;">
                <small>📍 Click location button above to see walking distance</small>
            </div>
            {nav_buttons}
        </div>
        """
        
        # Add marker for each dining hall
        folium.Marker(
            location=[info['lat'], info['lon']],
            popup=folium.Popup(popup_html, max_width=350),
            tooltip=f"{name} - Click for details & directions",
            icon=folium.Icon(
                color=info['color'],
                icon=info['icon'],
                prefix='fa'
            )
        ).add_to(vt_map)
        
        # Add dining hall name as label
        folium.Marker(
            location=[info['lat'], info['lon']],
            icon=folium.DivIcon(
                html=f"""<div style="font-size: 11px; color: #861F41; font-weight: bold; 
                        text-align: center; white-space: nowrap; 
                        text-shadow: 2px 2px 4px white, -2px -2px 4px white, 
                        2px -2px 4px white, -2px 2px 4px white;">
                        {name.split('(')[0].strip()}</div>""",
                icon_size=(100, 20),
                icon_anchor=(50, -10)
            )
        ).add_to(vt_map)
    
    # Add different tile layers
    folium.TileLayer('CartoDB positron', name='Light Mode').add_to(vt_map)
    folium.TileLayer('CartoDB dark_matter', name='Dark Mode').add_to(vt_map)
    folium.TileLayer(
        tiles='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attr='Esri',
        name='Satellite View',
        overlay=False,
        control=True
    ).add_to(vt_map)
    
    # Add map controls
    folium.LayerControl().add_to(vt_map)
    plugins.Fullscreen().add_to(vt_map)
    
    # Add locate control for distance calculation
    plugins.LocateControl(
        auto_start=False,
        position='topleft',
        strings={
            'title': "📍 Show my location (for distance calc)",
            'popup': "You are here!"
        },
        locateOptions={
            'enableHighAccuracy': True,
            'watch': True,
            'setView': True,
            'maxZoom': 17
        }
    ).add_to(vt_map)
    
    # Add minimal VT branding
    vt_logo_html = '''
    <div style="position: fixed; 
                bottom: 30px; left: 10px; width: auto; height: auto; 
                background-color: white; border:1px solid #861F41; z-index:9999; 
                font-size:14px; padding: 8px; border-radius: 3px;">
    <span style="color: #861F41; font-weight: bold;">🦃 Virginia Tech Dining</span>
    </div>
    '''
    vt_map.get_root().html.add_child(folium.Element(vt_logo_html))
    
    return vt_map

def save_and_open_map(vt_map):
    """
    Save the map to a file and open it in the browser.
    """
    # Create directory if it doesn't exist
    save_dir = os.path.expanduser("~/Documents/VT_Dining_Maps/")
    os.makedirs(save_dir, exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"VT_Dining_Halls_{timestamp}.html"
    filepath = os.path.join(save_dir, filename)
    
    # Save the map
    vt_map.save(filepath)
    print(f"\n✅ Map saved to: {filepath}")
    
    # Open in browser
    try:
        webbrowser.open(f"file://{os.path.abspath(filepath)}")
        print("✅ Map opened in your default browser")
    except Exception as e:
        print(f"⚠️ Could not open browser automatically: {e}")
        print(f"   Please open the file manually: {filepath}")
    
    return filepath

def main():
    """
    Main function to run the VT Dining Halls GPS Navigator.
    """
    print("=" * 60)
    print("    🍴 VIRGINIA TECH DINING HALLS GPS NAVIGATOR 🍴")
    print("=" * 60)
    print(f"\n📊 Tracking {len(VT_DINING_HALLS)} all-you-care-to-eat dining locations")
    
    # Display dining hall information
    print("\n🏫 Available Dining Halls:")
    print("-" * 50)
    for name, info in VT_DINING_HALLS.items():
        print(f"  • {name}")
        print(f"    Hours: {info['hours']}")
    
    # Create the map
    print("\n🗺️  Creating interactive dining hall map...")
    vt_map = create_dining_map()
    
    # Save and open the map
    filepath = save_and_open_map(vt_map)
    
    # Print usage info
    print("\n" + "=" * 60)
    print("📱 MAP READY - OPENED IN YOUR BROWSER!")
    print("=" * 60)
    print("\n🎯 How to Use:")
    print("  1. Click any dining hall marker to see details")
    print("  2. Use the navigation buttons to get directions:")
    print("     • Google Maps (walking directions)")
    print("     • Apple Maps (iPhone/Mac users)")
    print("     • Waze (driving directions)")
    print("  3. Optional: Click location button (📍) for distance calculation")
    print("\n🦃 Go Hokies! Enjoy your meal!")

if __name__ == "__main__":
    main()
