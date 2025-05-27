/**
 * Google Photos Service
 * 
 * This service provides mock Google Photos functionality for the agentic workflow.
 * In a real implementation, this would connect to the actual Google Photos API.
 */

export interface Photo {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  description?: string;
  location?: string;
  date: Date;
  metadata: {
    width: number;
    height: number;
    size: number;
    camera?: string;
  };
}

export interface TripPhoto extends Photo {
  tripLocation: string;
  tripDate: string;
}

export class GooglePhotosService {
  // Mock data for demonstration - in real implementation, this would connect to Google Photos API
  private mockPhotos: Photo[] = [
    {
      id: "1",
      filename: "seattle_space_needle.jpg",
      url: "/api/photos/seattle_space_needle.jpg",
      thumbnailUrl: "/api/photos/thumbs/seattle_space_needle.jpg",
      description: "Space Needle view from Kerry Park",
      location: "Seattle, WA",
      date: new Date("2024-01-15"),
      metadata: { width: 1920, height: 1080, size: 2048000, camera: "iPhone 15 Pro" }
    },
    {
      id: "2", 
      filename: "seattle_pike_place.jpg",
      url: "/api/photos/seattle_pike_place.jpg",
      thumbnailUrl: "/api/photos/thumbs/seattle_pike_place.jpg",
      description: "Pike Place Market fish throwing",
      location: "Seattle, WA",
      date: new Date("2024-01-15"),
      metadata: { width: 1920, height: 1080, size: 1856000, camera: "iPhone 15 Pro" }
    },
    {
      id: "3",
      filename: "seattle_waterfront.jpg", 
      url: "/api/photos/seattle_waterfront.jpg",
      thumbnailUrl: "/api/photos/thumbs/seattle_waterfront.jpg",
      description: "Seattle waterfront and ferry",
      location: "Seattle, WA",
      date: new Date("2024-01-16"),
      metadata: { width: 1920, height: 1080, size: 2304000, camera: "iPhone 15 Pro" }
    },
    {
      id: "4",
      filename: "seattle_museum_flight.jpg",
      url: "/api/photos/seattle_museum_flight.jpg", 
      thumbnailUrl: "/api/photos/thumbs/seattle_museum_flight.jpg",
      description: "Museum of Flight aircraft display",
      location: "Seattle, WA",
      date: new Date("2024-01-16"),
      metadata: { width: 1920, height: 1080, size: 1792000, camera: "iPhone 15 Pro" }
    },
    {
      id: "5",
      filename: "seattle_sunset.jpg",
      url: "/api/photos/seattle_sunset.jpg",
      thumbnailUrl: "/api/photos/thumbs/seattle_sunset.jpg", 
      description: "Sunset over Elliott Bay",
      location: "Seattle, WA",
      date: new Date("2024-01-17"),
      metadata: { width: 1920, height: 1080, size: 2560000, camera: "iPhone 15 Pro" }
    },
    {
      id: "6",
      filename: "home_garden.jpg",
      url: "/api/photos/home_garden.jpg",
      thumbnailUrl: "/api/photos/thumbs/home_garden.jpg",
      description: "Spring flowers in the garden",
      location: "Home",
      date: new Date("2024-02-01"),
      metadata: { width: 1920, height: 1080, size: 1536000, camera: "iPhone 15 Pro" }
    }
  ];

  async searchPhotos(query: string): Promise<Photo[]> {
    // Simulate API delay
    await this.delay(500);

    const searchTerms = query.toLowerCase().split(' ');
    
    return this.mockPhotos.filter(photo => {
      const searchableText = `${photo.filename} ${photo.description} ${photo.location}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });
  }

  async getTripPhotos(location: string, startDate?: string, endDate?: string): Promise<TripPhoto[]> {
    // Simulate API delay
    await this.delay(800);

    const locationLower = location.toLowerCase();
    let filteredPhotos = this.mockPhotos.filter(photo => 
      photo.location?.toLowerCase().includes(locationLower)
    );

    if (startDate) {
      const start = new Date(startDate);
      filteredPhotos = filteredPhotos.filter(photo => photo.date >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredPhotos = filteredPhotos.filter(photo => photo.date <= end);
    }

    // Convert to TripPhoto format
    return filteredPhotos.map(photo => ({
      ...photo,
      tripLocation: location,
      tripDate: photo.date.toISOString().split('T')[0] ?? photo.date.toDateString()
    }));
  }

  async getPhotosByDate(startDate: string, endDate: string): Promise<Photo[]> {
    // Simulate API delay
    await this.delay(600);

    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.mockPhotos.filter(photo => 
      photo.date >= start && photo.date <= end
    );
  }

  async downloadPhotos(photos: Photo[]): Promise<Photo[]> {
    // Simulate download process
    await this.delay(1000);

    // In a real implementation, this would download the photos to local storage
    // For now, we'll just return the photos with updated URLs indicating they're "downloaded"
    return photos.map(photo => ({
      ...photo,
      url: `/downloads/${photo.filename}`,
      thumbnailUrl: `/downloads/thumbs/${photo.filename}`
    }));
  }

  async getRecentPhotos(limit: number = 10): Promise<Photo[]> {
    // Simulate API delay
    await this.delay(400);

    return this.mockPhotos
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  async getPhotosByLocation(location: string): Promise<Photo[]> {
    // Simulate API delay
    await this.delay(500);

    const locationLower = location.toLowerCase();
    return this.mockPhotos.filter(photo => 
      photo.location?.toLowerCase().includes(locationLower)
    );
  }

  async getPhotoMetadata(photoId: string): Promise<Photo | null> {
    // Simulate API delay
    await this.delay(200);

    return this.mockPhotos.find(photo => photo.id === photoId) || null;
  }

  // Helper method to simulate API delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to add mock photos (for testing)
  addMockPhoto(photo: Photo): void {
    this.mockPhotos.push(photo);
  }

  // Method to get all photos (for debugging)
  getAllPhotos(): Photo[] {
    return [...this.mockPhotos];
  }
} 